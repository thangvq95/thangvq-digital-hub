// backend/src/repos/repos.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RepositoryEntity } from './repository.entity';
import { CategoryEntity } from './category.entity';

const NINE_ROUTER_URL =
  process.env.NINE_ROUTER_URL || 'https://9router.phieucaphe.com/v1';
const NINE_ROUTER_MODEL = process.env.NINE_ROUTER_MODEL || 'gpt-4o-mini';

@Injectable()
export class ReposService {
  private readonly logger = new Logger(ReposService.name);

  constructor(
    @InjectRepository(RepositoryEntity)
    private readonly repo: Repository<RepositoryEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  // ─── List repos with tab filtering + pagination ───────────────────────────
  async findAll(
    tab: string = 'all',
    page = 1,
    limit = 20,
    categoryName?: string,
  ) {
    const qb = this.repo.createQueryBuilder('r');

    if (categoryName && categoryName.trim().toLowerCase() !== 'all') {
      const category = await this.categoryRepo.findOne({
        where: { name: categoryName.trim().toLowerCase() },
      });
      if (category) {
        qb.andWhere('r.category = :categoryId', { categoryId: category.id });
      } else {
        qb.andWhere('1 = 0');
      }
    }

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

    if (data.length > 0) {
      const fullNames = data.map((r) => r.full_name);
      const reposWithRelations = await this.repo.find({
        where: { full_name: In(fullNames) },
        relations: ['category'],
      });
      const relationMap = new Map(
        reposWithRelations.map((r) => [r.full_name, r.category]),
      );
      for (const r of data) {
        r.category = relationMap.get(r.full_name) || null;
      }
    }

    return { data, meta: { total, page, limit, tab } };
  }

  // ─── Get single repo ──────────────────────────────────────────────────────
  async findOne(fullName: string) {
    const repo = await this.repo.findOne({
      where: { full_name: fullName },
      relations: ['category'],
    });
    if (!repo) throw new NotFoundException(`Repo ${fullName} not found`);
    return repo;
  }

  // ─── Patch user fields (favorite, archive, dismiss new release, category) ─
  async patch(
    fullName: string,
    updates: Partial<
      Pick<
        RepositoryEntity,
        'is_favorite' | 'is_archived' | 'has_new_release' | 'is_read'
      >
    > & { category_id?: number | null },
  ) {
    const { category_id, ...rest } = updates;
    const repo = await this.repo.findOne({
      where: { full_name: fullName },
      relations: ['category'],
    });
    if (!repo) throw new NotFoundException(`Repo ${fullName} not found`);

    if (category_id !== undefined) {
      if (category_id === null) {
        repo.category = null;
      } else {
        const category = await this.categoryRepo.findOneBy({ id: category_id });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${category_id} not found`,
          );
        }
        repo.category = category;
      }
    }

    Object.assign(repo, rest);
    await this.repo.save(repo);
    return this.findOne(fullName);
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
    if (!repos || !Array.isArray(repos)) {
      this.logger.warn(
        `[upsert] received invalid or empty payload: ${typeof repos}`,
      );
      return { received: 0, new: 0 };
    }
    // DEBUG: log first repo's trending fields to verify Hermes payload shape
    if (repos.length > 0) {
      const sample = repos[0];
      this.logger.debug(
        `[upsert] sample payload — full_name=${sample.full_name} stars_growth=${sample.stars_growth} trending_rank=${sample.trending_rank} stars_total=${sample.stars_total}`,
      );
    }
    const incomingUrls = new Set(
      repos
        .map((r) => r.html_url)
        .filter(
          (url): url is string => typeof url === 'string' && url.length > 0,
        ),
    );

    const existingUrlRows =
      incomingUrls.size > 0
        ? await this.repo
            .createQueryBuilder('repo')
            .select('repo.html_url', 'html_url')
            .where('repo.html_url IN (:...urls)', {
              urls: Array.from(incomingUrls),
            })
            .getRawMany<{ html_url: string }>()
        : [];

    const existingUrlSet = new Set(existingUrlRows.map((row) => row.html_url));

    const rows = repos
      .map((r) => {
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

        return {
          ...r,
          stars_growth:
            stars_growth !== undefined
              ? (stars_growth ?? undefined)
              : undefined,
          avatar_url: typeof avatar_url === 'string' ? avatar_url : undefined,
          analyze_status: 'idle',
          last_scraped_at: new Date(),
        };
      })
      .filter((r) => r.full_name && r.html_url);

    if (rows.length > 0) {
      await this.repo
        .createQueryBuilder()
        .insert()
        .into(RepositoryEntity)
        .values(rows)
        .orUpdate(
          [
            'stars_total',
            'stars_growth',
            'description',
            'avatar_url',
            'language',
            'trending_rank',
            'last_scraped_at',
            'forks_total',
          ],
          ['full_name'],
        )
        .execute();
    }

    const newCount = Array.from(incomingUrls).filter(
      (url) => !existingUrlSet.has(url),
    ).length;

    // Run classification in the background for only the repositories in this upsert batch that are uncategorized
    const fullNames = rows.map((r) => r.full_name);
    this.repo
      .find({
        where: { full_name: In(fullNames) },
        relations: ['category'],
      })
      .then((updatedRepos) => {
        const uncategorized = updatedRepos.filter((r) => !r.category);
        if (uncategorized.length > 0) {
          (async () => {
            for (const r of uncategorized) {
              await this.classifyRepo(r).catch((err) => {
                this.logger.error(
                  `Failed to classify ${r.full_name} in background: ${err.message}`,
                );
              });
            }
          })().catch((err) => {
            this.logger.error(
              `Error in background batch classification: ${err.message}`,
            );
          });
        }
      })
      .catch((err) => {
        this.logger.error(
          `Failed to find upserted repos for background classification: ${err.message}`,
        );
      });

    return { received: repos.length, new: newCount };
  }

  // ─── Manual Add Repo ──────────────────────────────────────────────────────
  async addManualRepo(urlOrFullName: string): Promise<RepositoryEntity> {
    let fullName = urlOrFullName
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
      .trim();
    fullName = fullName.replace(/\/$/, '').replace(/\.git$/, '');

    const existing = await this.repo.findOne({
      where: { full_name: fullName },
      relations: ['category'],
    });
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

    const data = (await res.json()) as {
      full_name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      owner?: { avatar_url?: string };
      stargazers_count: number;
      forks_count: number;
    };

    const newRepo = this.repo.create({
      full_name: data.full_name,
      description: data.description ?? undefined,
      html_url: data.html_url,
      language: data.language ?? undefined,
      avatar_url: data.owner?.avatar_url ?? undefined,
      stars_total: data.stargazers_count,
      forks_total: data.forks_count,
      is_favorite: false,
      is_archived: false,
      has_new_release: false,
      is_read: true,
      analyze_status: 'idle',
      last_scraped_at: new Date(),
    });

    const saved = await this.repo.save(newRepo);
    await this.classifyRepo(saved);

    // Auto-trigger magic AI analysis in the background
    await this.triggerAnalyze(saved.full_name).catch((err) => {
      this.logger.error(
        `Failed to auto-trigger analysis for ${saved.full_name}: ${err.message}`,
      );
    });

    return this.findOne(saved.full_name);
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
    if (!releases || !Array.isArray(releases)) {
      this.logger.warn(
        `[checkReleases] received invalid or empty payload: ${typeof releases}`,
      );
      return { received: 0, updated: 0 };
    }
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

  // ─── Categories CRUD ──────────────────────────────────────────────────────
  async findAllCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async createCategory(name: string) {
    const cleanName = name.trim().toLowerCase();
    let existing = await this.categoryRepo.findOneBy({ name: cleanName });
    if (!existing) {
      existing = this.categoryRepo.create({ name: cleanName });
      await this.categoryRepo.save(existing);
    }
    return existing;
  }

  async updateCategory(id: number, name: string) {
    const cleanName = name.trim().toLowerCase();
    await this.categoryRepo.update(id, { name: cleanName });
    return this.categoryRepo.findOneBy({ id });
  }

  async deleteCategory(id: number) {
    await this.categoryRepo.delete(id);
  }

  // ─── Repository Classification Logic ──────────────────────────────────────
  async classifyRepo(repo: RepositoryEntity): Promise<void> {
    try {
      const fullName = repo.full_name.toLowerCase();
      const description = (repo.description || '').toLowerCase();
      const tags = (repo.tags || []).map((t) => t.toLowerCase());

      let matchedCategoryName: string | null = null;

      // 1. memory: Understand-Anything, Gitnexus, agentmemory, colbymchenry/codegraph
      if (
        fullName.includes('understand-anything') ||
        fullName.includes('gitnexus') ||
        fullName.includes('agentmemory') ||
        fullName.includes('codegraph') ||
        description.includes('knowledge graph') ||
        description.includes('agent memory') ||
        tags.includes('knowledge-graph') ||
        tags.includes('memory')
      ) {
        matchedCategoryName = 'memory';
      }
      // 2. skills: Superpowers, mattpocock/skills, agent-skills
      else if (
        fullName.includes('superpowers') ||
        fullName.includes('skills') ||
        fullName.includes('agent-skills') ||
        fullName.includes('planning') ||
        description.includes('agent skills') ||
        tags.includes('skills') ||
        tags.includes('planning')
      ) {
        matchedCategoryName = 'skills';
      }
      // 3. finance: TradingAgents, financial-services
      else if (
        fullName.includes('tradingagents') ||
        fullName.includes('financial-services') ||
        fullName.includes('finance') ||
        fullName.includes('trading') ||
        description.includes('financial') ||
        tags.includes('finance') ||
        tags.includes('trading')
      ) {
        matchedCategoryName = 'finance';
      }
      // 4. video:
      else if (
        fullName.includes('video') ||
        fullName.includes('remotion') ||
        description.includes('video') ||
        description.includes('remotion') ||
        tags.includes('video') ||
        tags.includes('remotion')
      ) {
        matchedCategoryName = 'video';
      }

      // 5. Fallback: LLM Classification via 9Router
      if (!matchedCategoryName) {
        const NINE_ROUTER_API_KEY =
          process.env.NINE_ROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
        if (NINE_ROUTER_API_KEY) {
          const existingCategories = await this.categoryRepo.find();
          const catList = existingCategories.map((c) => c.name);

          const prompt = `You are a technical classifier. Given a GitHub repository:
- Name: ${repo.full_name}
- Description: ${repo.description || 'N/A'}
- Language: ${repo.language || 'N/A'}
- Tags: ${repo.tags?.join(', ') || 'N/A'}

Existing categories are: ${JSON.stringify(catList)}

Classify this repository into one of the existing categories if it matches. If none of the existing categories are a good fit, suggest a new, appropriate, lowercase category name representing its technical domain (e.g. 'database', 'llm', 'devops', 'web-framework').
Return a JSON object in this format:
{
  "categoryName": "suggested category name"
}`;

          const llmRes = await fetch(`${NINE_ROUTER_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${NINE_ROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: NINE_ROUTER_MODEL,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: 'You only output JSON.' },
                { role: 'user', content: prompt },
              ],
              temperature: 0.2,
              stream: false,
            }),
          });

          if (llmRes.ok) {
            const data = (await llmRes.json()) as {
              choices?: { message?: { content?: string } }[];
            };
            const cleanContent = data.choices?.[0]?.message?.content?.trim();
            if (cleanContent) {
              try {
                const parsed = JSON.parse(cleanContent) as {
                  categoryName?: string;
                };
                if (parsed.categoryName) {
                  matchedCategoryName = parsed.categoryName
                    .trim()
                    .toLowerCase();
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                this.logger.error(
                  `Failed to parse category classification JSON: ${msg}`,
                );
              }
            }
          }
        }
      }

      if (matchedCategoryName) {
        let category = await this.categoryRepo.findOneBy({
          name: matchedCategoryName,
        });
        if (!category) {
          category = this.categoryRepo.create({ name: matchedCategoryName });
          await this.categoryRepo.save(category);
        }
        repo.category = category;
        await this.repo.save(repo);
        this.logger.log(
          `Classified ${repo.full_name} as "${matchedCategoryName}"`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Classification failed for ${repo.full_name}: ${msg}`);
    }
  }

  async classifyAllRepos(): Promise<{ processed: number }> {
    const repos = await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.category', 'cat')
      .where('r.category_id IS NULL')
      .getMany();

    let count = 0;
    for (const r of repos) {
      await this.classifyRepo(r);
      count++;
    }
    return { processed: count };
  }
}
