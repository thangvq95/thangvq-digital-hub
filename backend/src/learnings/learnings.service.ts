import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { LearningEntity } from './learning.entity';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';

const NINE_ROUTER_URL =
  process.env.NINE_ROUTER_URL || 'https://9router.phieucaphe.com/v1';
const NINE_ROUTER_MODEL =
  process.env.NINE_ROUTER_MODEL || 'gpt-4o-mini';
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

// Rule-based subtopic classification keywords
const SUBTOPIC_RULES: Record<string, string[]> = {
  navigation: [
    'navigator', 'go_router', 'auto_route', 'routing', 'gorouter',
    'navigation', 'push', 'pop', 'route',
  ],
  'state-management': [
    'bloc', 'riverpod', 'provider', 'cubit', 'getx', 'setstate',
    'state management', 'redux', 'mobx', 'signals',
  ],
  deeplink: [
    'deep link', 'deeplink', 'universal link', 'app link', 'uri scheme',
    'dynamic link',
  ],
  'ui-widgets': [
    'widget', 'listview', 'scrollview', 'container', 'layout',
    'scaffold', 'appbar', 'sliverappbar', 'customscrollview',
    'gridview', 'column', 'row', 'stack', 'positioned',
  ],
  architecture: [
    'clean architecture', 'mvvm', 'mvc', 'repository pattern',
    'solid', 'design pattern', 'hexagonal',
  ],
  performance: [
    'performance', 'optimization', 'jank', 'frame rate', 'memory leak',
    'profiling', 'devtools', 'render', 'build method',
  ],
  testing: [
    'test', 'widget test', 'integration test', 'unit test', 'mockito',
    'bloc_test', 'golden test',
  ],
  animations: [
    'animation', 'lottie', 'rive', 'tween', 'implicit animation',
    'hero animation', 'animated', 'motion',
  ],
  networking: [
    'http', 'dio', 'retrofit', 'api call', 'rest api', 'graphql',
    'websocket', 'grpc',
  ],
  storage: [
    'hive', 'sqflite', 'shared_preferences', 'isar', 'drift',
    'local storage', 'database', 'objectbox',
  ],
  'dependency-injection': [
    'get_it', 'injectable', 'dependency injection', 'service locator',
  ],
  'ci-cd': [
    'ci/cd', 'github actions', 'codemagic', 'fastlane', 'bitrise',
    'firebase distribution',
  ],
  'dart-language': [
    'dart 3', 'sealed class', 'pattern matching', 'records',
    'extension type', 'dart', 'mixin', 'typedef',
  ],
  kotlin: [
    'kotlin', 'coroutines', 'flow', 'sealed class', 'data class',
    'suspend',
  ],
  'jetpack-compose': [
    'compose', 'composable', 'modifier', 'lazycolumn', 'material3',
    'jetpack compose',
  ],
  gradle: [
    'gradle', 'build.gradle', 'agp', 'version catalog', 'kts',
  ],
  security: [
    'security', 'ssl pinning', 'obfuscation', 'proguard', 'r8',
    'encryption', 'keystore',
  ],
  accessibility: [
    'accessibility', 'a11y', 'semantics', 'talkback', 'voiceover',
    'screen reader',
  ],
  'platform-channels': [
    'platform channel', 'method channel', 'event channel', 'pigeon',
    'ffi', 'native module',
  ],
};

@Injectable()
export class LearningsService {
  private readonly logger = new Logger(LearningsService.name);

  constructor(
    @InjectRepository(LearningEntity)
    private readonly learningRepo: Repository<LearningEntity>,
    @InjectRepository(LearningTopicEntity)
    private readonly topicRepo: Repository<LearningTopicEntity>,
    @InjectRepository(LearningSubtopicEntity)
    private readonly subtopicRepo: Repository<LearningSubtopicEntity>,
  ) {}

  // ─── List learnings with filters ─────────────────────────────────────────
  async findAll(params: {
    tab?: string;
    topic?: string;
    subtopic?: string;
    page?: number;
    limit?: number;
  }) {
    const { tab = 'to_learn', topic, subtopic, page = 1, limit = 20 } = params;

    const qb = this.learningRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.topic', 'topic')
      .leftJoinAndSelect('l.subtopic', 'subtopic');

    // Tab filters
    if (tab === 'to_learn') {
      qb.andWhere('l.is_learned = false');
    } else if (tab === 'learned') {
      qb.andWhere('l.is_learned = true');
    } else if (tab === 'favorites') {
      qb.andWhere('l.is_favorite = true');
    }

    // Topic filter
    if (topic) {
      qb.andWhere('topic.name = :topic', { topic });
    }

    // Subtopic filter
    if (subtopic) {
      qb.andWhere('subtopic.name = :subtopic', { subtopic });
    }

    qb.orderBy('l.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, tab } };
  }

  // ─── Get single learning ────────────────────────────────────────────────
  async findOne(id: string) {
    const learning = await this.learningRepo.findOne({
      where: { id },
      relations: ['topic', 'subtopic'],
    });
    if (!learning) throw new NotFoundException(`Learning ${id} not found`);
    return learning;
  }

  // ─── Patch learning fields ──────────────────────────────────────────────
  async patch(
    id: string,
    updates: Partial<Pick<LearningEntity, 'is_learned' | 'is_favorite'>> & {
      subtopic_id?: number | null;
    },
  ) {
    const { subtopic_id, ...rest } = updates;
    const learning = await this.learningRepo.findOne({
      where: { id },
      relations: ['topic', 'subtopic'],
    });
    if (!learning) throw new NotFoundException(`Learning ${id} not found`);

    if (subtopic_id !== undefined) {
      if (subtopic_id === null) {
        learning.subtopic = null;
      } else {
        const subtopic = await this.subtopicRepo.findOneBy({ id: subtopic_id });
        if (!subtopic) {
          throw new NotFoundException(`Subtopic ${subtopic_id} not found`);
        }
        learning.subtopic = subtopic;
      }
    }

    Object.assign(learning, rest);
    await this.learningRepo.save(learning);
    return this.findOne(id);
  }

  // ─── Topics & Subtopics ────────────────────────────────────────────────
  async findAllTopics() {
    return this.topicRepo.find({ order: { name: 'ASC' } });
  }

  async findAllSubtopics() {
    return this.subtopicRepo.find({ order: { display_name: 'ASC' } });
  }

  // ─── Manual Add ─────────────────────────────────────────────────────────
  async addManual(input: {
    url?: string;
    text?: string;
    image?: Buffer;
    imageFilename?: string;
    topic?: string; // 'flutter' or 'android'
    title?: string;
  }): Promise<LearningEntity> {
    // 1. Compute content hash for dedup
    let hashSource: string | Buffer;
    if (input.url) {
      hashSource = input.url;
    } else if (input.image) {
      hashSource = input.image;
    } else if (input.text) {
      hashSource = input.text;
    } else {
      throw new Error('Must provide url, image, or text');
    }
    const contentHash = this.computeHash(hashSource);

    // 2. Check dedup
    const existing = await this.learningRepo.findOne({
      where: { content_hash: contentHash },
      relations: ['topic', 'subtopic'],
    });
    if (existing) return existing;

    // 3. Determine source type
    let sourceType = 'manual';
    if (input.url) {
      if (input.url.includes('linkedin.com')) sourceType = 'linkedin';
      else if (input.url.includes('medium.com')) sourceType = 'medium';
      else if (input.url.includes('dart.dev') || input.url.includes('flutter.dev'))
        sourceType = 'official_blog';
    } else if (input.image) {
      sourceType = 'image';
    }

    // 4. Process image (compress to ≤150KB)
    let imagePath: string | null = null;
    if (input.image) {
      const uuid = randomUUID();
      const compressed = await this.compressImage(input.image);
      const dir = join(UPLOADS_DIR, 'learnings');
      await mkdir(dir, { recursive: true });
      const filename = `${uuid}.webp`;
      await writeFile(join(dir, filename), compressed);
      imagePath = `learnings/${filename}`;
    }

    // 5. Resolve topic
    const topicName = input.topic || 'flutter'; // default to flutter
    let topic = await this.topicRepo.findOneBy({ name: topicName });
    if (!topic) {
      topic = await this.topicRepo.findOneBy({ name: 'flutter' });
    }

    // 6. Create learning record
    const learning = this.learningRepo.create({
      title: input.title || 'Untitled Learning',
      source_url: input.url || null,
      source_type: sourceType,
      image_path: imagePath,
      topic: topic!,
      content_hash: contentHash,
      analyze_status: 'analyzing',
    });

    const saved = await this.learningRepo.save(learning);

    // 7. Fire-and-forget: AI analysis
    this.runAnalysis(saved, input.url, input.text).catch((err) => {
      this.logger.error(`Analysis failed for learning ${saved.id}: ${err.message}`);
    });

    return this.findOne(saved.id);
  }

  // ─── Batch upsert from Hermes cronjob ───────────────────────────────────
  async upsert(
    items: {
      title: string;
      source_url: string;
      source_type?: string;
      topic?: string;
      description?: string;
    }[],
  ): Promise<{ received: number; new: number; skipped: number }> {
    let newCount = 0;
    let skipped = 0;

    for (const item of items) {
      const contentHash = this.computeHash(item.source_url);

      // Dedup check
      const existing = await this.learningRepo.findOneBy({
        content_hash: contentHash,
      });
      if (existing) {
        skipped++;
        continue;
      }

      // Resolve topic
      const topicName = item.topic || 'flutter';
      let topic = await this.topicRepo.findOneBy({ name: topicName });
      if (!topic) {
        topic = await this.topicRepo.findOneBy({ name: 'flutter' });
      }

      const learning = this.learningRepo.create({
        title: item.title,
        source_url: item.source_url,
        source_type: item.source_type || 'manual',
        summary: item.description || null,
        topic: topic!,
        content_hash: contentHash,
        analyze_status: 'idle',
      });

      const saved = await this.learningRepo.save(learning);
      newCount++;

      // Background classification
      this.classifyLearning(saved).catch((err) => {
        this.logger.error(
          `Classification failed for ${saved.id}: ${err.message}`,
        );
      });
    }

    return { received: items.length, new: newCount, skipped };
  }

  // ─── Image compression ≤150KB ───────────────────────────────────────────
  async compressImage(buffer: Buffer): Promise<Buffer> {
    let quality = 80;
    let result = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    // Iteratively reduce quality until under 150KB
    while (result.length > 150 * 1024 && quality > 20) {
      quality -= 10;
      result = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }

    // If still over 150KB after quality reduction, resize width down
    if (result.length > 150 * 1024) {
      result = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 30 })
        .toBuffer();
    }

    return result;
  }

  // ─── SHA256 hash for dedup ──────────────────────────────────────────────
  private computeHash(input: string | Buffer): string {
    return createHash('sha256').update(input).digest('hex');
  }

  // ─── AI Analysis pipeline ──────────────────────────────────────────────
  private async runAnalysis(
    learning: LearningEntity,
    url?: string,
    text?: string,
  ): Promise<void> {
    try {
      let content = text || '';

      // Fetch content from URL if provided
      if (url && !content) {
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'ThangVQ-Digital-Hub/1.0' },
          });
          if (res.ok) {
            const html = await res.text();
            // Extract text content (strip HTML tags)
            content = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 5000);
          }
        } catch {
          this.logger.warn(`Failed to fetch URL content: ${url}`);
        }
      }

      const NINE_ROUTER_API_KEY =
        process.env.NINE_ROUTER_API_KEY || process.env.OPENAI_API_KEY || '';
      if (!NINE_ROUTER_API_KEY) {
        await this.learningRepo.update(learning.id, {
          analyze_status: 'failed',
        });
        return;
      }

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
            {
              role: 'system',
              content: `You are a senior mobile developer analyzing learning content about Flutter or Android development.
Return a JSON object:
{
  "title": "Concise, descriptive title for this learning",
  "summary": "Markdown-formatted summary with key takeaways. Use ### headings, bullet points, and code snippets if relevant. Keep it dense and valuable — no fluff. Max 300 words.",
  "topic": "flutter" or "android",
  "subtopic": "one of: navigation, state-management, deeplink, ui-widgets, architecture, performance, testing, animations, networking, storage, dependency-injection, ci-cd, dart-language, kotlin, jetpack-compose, gradle, security, accessibility, platform-channels, other"
}`,
            },
            {
              role: 'user',
              content: `Title: ${learning.title}\nSource: ${learning.source_url || 'N/A'}\nContent:\n${content || 'No content available — classify based on title only.'}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
          stream: false,
        }),
      });

      if (!llmRes.ok) {
        throw new Error(`9Router returned ${llmRes.status}`);
      }

      const llmData = await llmRes.json();
      const contentStr = llmData.choices?.[0]?.message?.content ?? '{}';

      let cleanJson = contentStr.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanJson);

      // Update title if AI provided a better one and current is generic
      const updateData: Partial<LearningEntity> = {
        analyze_status: 'done',
      };

      if (parsed.summary) {
        updateData.summary = parsed.summary;
      }
      if (
        parsed.title &&
        (learning.title === 'Untitled Learning' || !learning.title)
      ) {
        updateData.title = parsed.title;
      }

      // Resolve topic from AI
      if (parsed.topic) {
        const topic = await this.topicRepo.findOneBy({
          name: parsed.topic.toLowerCase(),
        });
        if (topic) {
          updateData.topic = topic;
        }
      }

      // Resolve subtopic from AI
      if (parsed.subtopic) {
        const subtopicName = parsed.subtopic.toLowerCase().trim();
        let subtopic = await this.subtopicRepo.findOneBy({
          name: subtopicName,
        });
        if (!subtopic) {
          // Auto-create new subtopic
          const displayName = subtopicName
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          subtopic = this.subtopicRepo.create({
            name: subtopicName,
            display_name: displayName,
          });
          await this.subtopicRepo.save(subtopic);
        }
        updateData.subtopic = subtopic;
      }

      await this.learningRepo.save({
        ...learning,
        ...updateData,
      });
      this.logger.log(`Analysis completed for learning ${learning.id}`);
    } catch (error) {
      this.logger.error(
        `Analysis failed for learning ${learning.id}: ${error.message}`,
      );
      await this.learningRepo.update(learning.id, {
        analyze_status: 'failed',
      });
    }
  }

  // ─── Rule-based subtopic classification ─────────────────────────────────
  async classifyLearning(learning: LearningEntity): Promise<void> {
    const searchText = `${learning.title} ${learning.summary || ''} ${learning.source_url || ''}`.toLowerCase();

    for (const [subtopicName, keywords] of Object.entries(SUBTOPIC_RULES)) {
      if (keywords.some((kw) => searchText.includes(kw))) {
        let subtopic = await this.subtopicRepo.findOneBy({
          name: subtopicName,
        });
        if (subtopic) {
          learning.subtopic = subtopic;
          await this.learningRepo.save(learning);
          this.logger.log(
            `Classified learning ${learning.id} as "${subtopicName}" (rule-based)`,
          );
          return;
        }
      }
    }

    // LLM fallback — same as runAnalysis but only for classification
    this.runAnalysis(learning, learning.source_url || undefined).catch(
      (err) => {
        this.logger.error(
          `LLM classification failed for ${learning.id}: ${err.message}`,
        );
      },
    );
  }
}
