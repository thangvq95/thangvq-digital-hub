// backend/src/repos/repos.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryEntity } from './repository.entity';

const NINE_ROUTER_URL =
  process.env.NINE_ROUTER_URL || 'https://9router.phieucaphe.com/v1';
const NINE_ROUTER_MODEL = process.env.NINE_ROUTER_MODEL || 'gpt-4o-mini';

@Injectable()
export class ReposService {
  private readonly logger = new Logger(ReposService.name);

  constructor(
    @InjectRepository(RepositoryEntity)
    private readonly repo: Repository<RepositoryEntity>,
  ) {}

  // ─── List repos with tab filtering + pagination ───────────────────────────
  async findAll(tab: string = 'all', page = 1, limit = 20) {
    const qb = this.repo.createQueryBuilder('r');

    if (tab === 'favorites') {
      qb.andWhere('r.is_favorite = true');
      qb.andWhere('r.is_archived = false');
    } else if (tab === 'archived') {
      qb.andWhere('r.is_archived = true');
    } else {
      // "all" — show non-archived repos
      qb.andWhere('r.is_archived = false');
    }

    // 1. Group: Today (0) vs Older (1)
    qb.orderBy(
      'CASE WHEN r.last_scraped_at >= CURRENT_DATE THEN 0 ELSE 1 END',
      'ASC',
    );

    // ─── TODAY'S REPOS ───
    // 2. Order by trending rank (1, 2, 3...)
    qb.addOrderBy(
      'CASE WHEN r.last_scraped_at >= CURRENT_DATE THEN r.trending_rank ELSE NULL END',
      'ASC',
      'NULLS LAST',
    );
    // 3. Fallback for today: parse 'stars_growth' string to int (e.g., "1,234 stars this week" -> 1234)
    qb.addOrderBy(
      "CASE WHEN r.last_scraped_at >= CURRENT_DATE THEN CAST(NULLIF(regexp_replace(r.stars_growth, '[^0-9]', '', 'g'), '') AS INTEGER) ELSE NULL END",
      'DESC',
      'NULLS LAST',
    );

    // ─── OLDER REPOS ───
    // 4. Order unread first (is_read = false)
    qb.addOrderBy(
      'CASE WHEN r.last_scraped_at < CURRENT_DATE THEN r.is_read ELSE NULL END',
      'ASC',
      'NULLS LAST',
    );

    // ─── GENERAL FALLBACK ───
    // 5. Order by total stars
    qb.addOrderBy('r.stars_total', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, tab } };
  }

  // ─── Get single repo ──────────────────────────────────────────────────────
  async findOne(fullName: string) {
    const repo = await this.repo.findOneBy({ full_name: fullName });
    if (!repo) throw new NotFoundException(`Repo ${fullName} not found`);
    return repo;
  }

  // ─── Patch user fields (favorite, archive, dismiss new release) ───────────
  async patch(
    fullName: string,
    updates: Partial<
      Pick<
        RepositoryEntity,
        'is_favorite' | 'is_archived' | 'has_new_release' | 'is_read'
      >
    >,
  ) {
    await this.repo.update({ full_name: fullName }, updates);
    return this.repo.findOneBy({ full_name: fullName });
  }

  // ─── Trigger async AI analysis (Approach C: async + polling) ──────────────
  async triggerAnalyze(fullName: string): Promise<RepositoryEntity | null> {
    const repo = await this.repo.findOneBy({ full_name: fullName });
    if (!repo) throw new NotFoundException(`Repo ${fullName} not found`);

    // Mark as analyzing (FE will poll for status change)
    await this.repo.update(
      { full_name: fullName },
      { analyze_status: 'analyzing' },
    );

    // Fire-and-forget: run analysis in background
    this.runAnalysis(repo).catch((err) => {
      this.logger.error(`Analysis failed for ${fullName}: ${err.message}`);
    });

    return this.repo.findOneBy({ full_name: fullName });
  }

  // ─── Background analysis: fetch README → call 9Router LLM → save ─────────
  private async runAnalysis(repo: RepositoryEntity): Promise<void> {
    try {
      // 1. Fetch README from GitHub API
      const readmeRes = await fetch(
        `https://api.github.com/repos/${repo.full_name}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.raw+json',
            'User-Agent': 'ThangVQ-Digital-Hub/1.0',
          },
        },
      );

      let readmeContent = '';
      if (readmeRes.ok) {
        readmeContent = await readmeRes.text();
        // Truncate to ~8000 chars to stay within LLM context limits
        if (readmeContent.length > 8000) {
          readmeContent =
            readmeContent.substring(0, 8000) + '\n\n[...truncated]';
        }
      } else {
        readmeContent = 'No README available for this repository.';
      }

      // 2. Call 9Router LLM
      const NINE_ROUTER_API_KEY =
        process.env.NINE_ROUTER_API_KEY || process.env.OPENAI_API_KEY || '';

      const llmRes = await fetch(`${NINE_ROUTER_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(NINE_ROUTER_API_KEY
            ? { Authorization: `Bearer ${NINE_ROUTER_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          model: NINE_ROUTER_MODEL,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are a Principal Software Engineer evaluating a GitHub repository. Based on the README, you must return a JSON object with this structure:
{
  "summary": "A highly concise, punchy Markdown string.",
  "tags": ["array", "of", "relevant", "tags"]
}

For the "summary", use explicit markdown (###, **, -). Keep it extremely concise and dense with value. No fluff or marketing speak.

### Overview
1-2 sentences maximum explaining what it is and the core problem it solves.

### Use Cases & Integrations
This is the most important section. Think beyond the README! Based on your broad engineering knowledge of this tool's domain:
- Provide 3 concrete, advanced use cases.
- Explicitly suggest powerful tool integrations (e.g., n8n, LangChain, Supabase, Vercel, Docker) that developers typically combine with this tool, even if not mentioned in the README.

### Tech Stack & Architecture
Bullet points of key technologies. If it involves a complex workflow, use a \`\`\`mermaid diagram. Otherwise, keep it very short.

Rules for the Markdown summary:
- Write in English.
- Be extremely concise, punchy, and action-oriented. Use bullet points heavily.
- Use Mermaid diagrams (\`\`\`mermaid) ONLY when explaining complex workflows.
- Do NOT include installation instructions or basic tutorials.

Rules for tags:
- Provide 3 to 6 tags.
- Use lower-case, short, highly relevant keywords (e.g., 'database', 'react', 'llm', 'automation').`,
            },
            {
              role: 'user',
              content: `Repository: ${repo.full_name}\nDescription: ${repo.description ?? 'N/A'}\nLanguage: ${repo.language ?? 'N/A'}\nStars: ${repo.stars_total}\n\nREADME:\n${readmeContent}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          stream: false,
        }),
      });

      if (!llmRes.ok) {
        const errorText = await llmRes.text();
        throw new Error(`9Router returned ${llmRes.status}: ${errorText}`);
      }

      let contentStr = '';
      const rawText = await llmRes.text();
      try {
        const llmData = JSON.parse(rawText);
        contentStr = llmData.choices?.[0]?.message?.content ?? '{}';
      } catch {
        // If it's somehow still returning SSE (some proxies force stream), accumulate the chunks
        if (rawText.includes('data: ')) {
          const lines = rawText.split('\\n');
          let fullContent = '';
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const chunk = JSON.parse(line.replace('data: ', ''));
                if (chunk.choices?.[0]?.delta?.content) {
                  fullContent += chunk.choices[0].delta.content;
                } else if (chunk.choices?.[0]?.message?.content) {
                  fullContent += chunk.choices[0].message.content;
                }
              } catch {}
            }
          }
          if (fullContent) {
            contentStr = fullContent;
          } else {
            throw new Error(`Failed to extract content from SSE stream.`);
          }
        } else {
          throw new Error(
            `Failed to parse LLM response JSON. Raw: ${rawText.substring(0, 100)}`,
          );
        }
      }

      let aiSummary = 'Analysis failed.';
      let tags: string[] = [];
      try {
        // Some models wrap the JSON output in markdown code blocks
        let cleanJson = contentStr.trim();
        if (cleanJson.startsWith('\`\`\`json')) {
          cleanJson = cleanJson
            .replace(/^\`\`\`json/, '')
            .replace(/\`\`\`$/, '')
            .trim();
        } else if (cleanJson.startsWith('\`\`\`')) {
          cleanJson = cleanJson
            .replace(/^\`\`\`/, '')
            .replace(/\`\`\`$/, '')
            .trim();
        }

        const parsed = JSON.parse(cleanJson);
        aiSummary = parsed.summary ?? aiSummary;
        tags = Array.isArray(parsed.tags) ? parsed.tags : [];
      } catch (e) {
        this.logger.error(`Failed to parse LLM JSON response: ${e.message}`);
        // Try to salvage if it's completely broken (including truncation without closing quotes)
        const summaryMatch = contentStr.match(/"summary"\s*:\s*"([\s\S]*)/);
        if (summaryMatch && summaryMatch[1]) {
          let extracted = summaryMatch[1];
          // Remove trailing JSON artifacts if it wasn't completely truncated
          extracted = extracted.replace(/"\s*(?:,|})\s*[\s\S]*$/, '');
          if (extracted.endsWith('"')) {
            extracted = extracted.slice(0, -1);
          }
          // Unescape literal \n to actual newlines
          aiSummary = extracted.replace(/\\n/g, '\n').replace(/\\"/g, '"');

          // If we managed to salvage summary, try to salvage tags too
          const tagsMatch = contentStr.match(/"tags"\s*:\s*\[(.*?)\]/);
          if (tagsMatch && tagsMatch[1]) {
            tags = tagsMatch[1]
              .split(',')
              .map((t) => t.replace(/"/g, '').trim())
              .filter(Boolean);
          }
        } else {
          aiSummary = contentStr; // Absolute fallback
        }
      }

      // 3. Save result to database
      await this.repo.update(
        { full_name: repo.full_name },
        { ai_summary: aiSummary, tags, analyze_status: 'done' },
      );

      this.logger.log(`Analysis completed for ${repo.full_name}`);
    } catch (error) {
      this.logger.error(
        `Analysis failed for ${repo.full_name}: ${error.message}`,
      );
      await this.repo.update(
        { full_name: repo.full_name },
        { analyze_status: 'failed' },
      );
    }
  }

  private normalizeAvatarUrl(url: unknown): string | undefined {
    if (typeof url !== 'string' || !url) return undefined;
    const match = url.match(/^https?:\/\/github\.com\/([^/?#]+)\.png/i);
    if (match) {
      return `https://avatars.githubusercontent.com/${match[1]}`;
    }
    return url;
  }

  private sanitizeStarsGrowth(val: string | null | undefined): string | null {
    if (typeof val !== 'string') return null;
    return val.replace(/[\s\S]*?<\/svg>\s*/, '');
  }

  // ─── Batch upsert from Hermes trending sync (append-only) ─────────────────
  async upsert(
    repos: Partial<RepositoryEntity>[],
  ): Promise<{ received: number; new: number }> {
    // DEBUG: log first repo's trending fields to verify Hermes payload shape
    if (repos.length > 0) {
      const sample = repos[0];
      this.logger.debug(
        `[upsert] sample payload — full_name=${sample.full_name} stars_growth=${sample.stars_growth} trending_rank=${sample.trending_rank} stars_total=${sample.stars_total}`,
      );
    }
    let newCount = 0;
    for (const r of repos) {
      const existing = await this.repo.findOneBy({ full_name: r.full_name });

      // Normalize avatar_url: handle both flat property and nested owner object from GitHub API
      const rawAvatar =
        r.avatar_url ||
        (r as Partial<RepositoryEntity> & { owner?: { avatar_url?: string } })
          .owner?.avatar_url;
      const avatar_url = this.normalizeAvatarUrl(rawAvatar);

      const stars_growth =
        r.stars_growth !== undefined
          ? this.sanitizeStarsGrowth(r.stars_growth)
          : undefined;

      if (!existing) {
        await this.repo.save({
          ...r,
          stars_growth:
            stars_growth !== undefined
              ? (stars_growth ?? undefined)
              : undefined,
          avatar_url: typeof avatar_url === 'string' ? avatar_url : undefined,
          is_favorite: false,
          is_archived: false,
          has_new_release: false,
          is_read: false,
          analyze_status: 'idle',
          last_scraped_at: new Date(),
        });
        newCount++;
      } else {
        // Update dynamic GitHub-sourced metadata while strictly preserving user state/preferences.
        // We construct the update object dynamically to only update fields that are provided
        // and avoid overwriting existing valid data with undefined/null from partial Hermes payloads.
        const updateData: Partial<RepositoryEntity> = {
          last_scraped_at: new Date(),
        };

        if (r.description !== undefined) updateData.description = r.description;
        if (r.html_url !== undefined) updateData.html_url = r.html_url;
        if (r.language !== undefined) updateData.language = r.language;
        if (r.stars_total !== undefined) updateData.stars_total = r.stars_total;
        if (stars_growth !== undefined)
          updateData.stars_growth = stars_growth ?? undefined;
        if (r.forks_total !== undefined) updateData.forks_total = r.forks_total;
        if (r.trending_rank !== undefined)
          updateData.trending_rank = r.trending_rank;

        // Only update avatar_url if we found a valid string
        if (typeof avatar_url === 'string' && avatar_url.length > 0) {
          updateData.avatar_url = avatar_url;
        }

        await this.repo.update({ full_name: r.full_name }, updateData);
      }
    }
    return { received: repos.length, new: newCount };
  }

  // ─── Manual Add Repo ──────────────────────────────────────────────────────
  async addManualRepo(urlOrFullName: string): Promise<RepositoryEntity> {
    let fullName = urlOrFullName
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
      .trim();
    fullName = fullName.replace(/\/$/, '').replace(/\.git$/, '');

    const existing = await this.repo.findOneBy({ full_name: fullName });
    if (existing) return existing;

    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ThangVQ-Digital-Hub/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();

    const newRepo = this.repo.create({
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      language: data.language,
      avatar_url: data.owner?.avatar_url,
      stars_total: data.stargazers_count,
      forks_total: data.forks_count,
      is_favorite: false,
      is_archived: false,
      has_new_release: false,
      is_read: true,
      analyze_status: 'idle',
      last_scraped_at: new Date(),
    });

    return this.repo.save(newRepo);
  }

  // ─── Sync latest release from GitHub API ────────────────────────────────
  async syncRelease(fullName: string): Promise<RepositoryEntity> {
    const repo = await this.repo.findOneBy({ full_name: fullName });
    if (!repo) throw new NotFoundException(`Repo ${fullName} not found`);

    const res = await fetch(
      `https://api.github.com/repos/${fullName}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'ThangVQ-Digital-Hub/1.0',
        },
      },
    );

    if (res.ok) {
      const data = await res.json();
      let summarizedBody = data.body;

      // Only summarize if the body is long enough to warrant it
      if (data.body && data.body.length > 300) {
        try {
          summarizedBody = await this.summarizeRelease(
            fullName,
            data.tag_name,
            data.body,
          );
        } catch (err) {
          this.logger.error(
            `Failed to summarize release for ${fullName}: ${err.message}`,
          );
          // Fallback to raw body if AI fails
        }
      }

      await this.repo.update(
        { full_name: fullName },
        {
          latest_release_tag: data.tag_name,
          latest_release_body: summarizedBody,
          has_new_release: false,
        },
      );
    } else if (res.status === 404) {
      // No releases found
      await this.repo.update(
        { full_name: fullName },
        {
          latest_release_tag: null,
          latest_release_body: null,
          has_new_release: false,
        },
      );
    }

    const updated = await this.repo.findOneBy({ full_name: fullName });
    if (!updated) throw new Error('Repo not found after sync');
    return updated;
  }

  private async summarizeRelease(
    fullName: string,
    tag: string,
    body: string,
  ): Promise<string> {
    const NINE_ROUTER_API_KEY =
      process.env.NINE_ROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
    if (!NINE_ROUTER_API_KEY) return body;

    const res = await fetch(`${NINE_ROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NINE_ROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: NINE_ROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a Principal Engineer summarizing GitHub release notes. 
Extract only the most important developer-relevant changes. 
Format the output in clean Markdown using these sections (only if they have content):
- 🚀 **Features**
- ⚠️ **Breaking Changes**
- 🐛 **Fixes**
- 📦 **Internal / Chore**

Rules:
- Be extremely concise and technical.
- Remove all boilerplate like "Full Changelog", contributor lists, emojis (except section headers), and repetitive links.
- Use bullet points.
- If the release is trivial, provide a 1-sentence summary.
- Max 150 words total.`,
          },
          {
            role: 'user',
            content: `Repository: ${fullName}\nRelease: ${tag}\n\nRaw Notes:\n${body.substring(0, 6000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!res.ok) throw new Error(`9Router error: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? body;
  }

  // ─── Batch check releases for favorite repos (from Hermes cron) ───────────
  async checkReleases(
    releases: { full_name: string; tag_name: string }[],
  ): Promise<{ received: number; updated: number }> {
    let updated = 0;
    for (const r of releases) {
      const existing = await this.repo.findOneBy({ full_name: r.full_name });
      if (existing && existing.latest_release_tag !== r.tag_name) {
        await this.repo.update(
          { full_name: r.full_name },
          {
            latest_release_tag: r.tag_name,
            has_new_release: true,
          },
        );
        updated++;
      }
    }
    return { received: releases.length, updated };
  }
}
