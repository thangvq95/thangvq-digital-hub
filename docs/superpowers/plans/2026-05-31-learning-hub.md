# Learning Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/learning` route with backend module for capturing, classifying, and reviewing Flutter & Android learning content from multiple sources.

**Architecture:** Independent NestJS module (`backend/src/learnings/`) with its own entities, controller, and service. Frontend mirrors the TechTrend pattern (`app/learning/`, `components/learning/`). Hermes cronjob scrapes content daily, AI classifies subtopics, images compressed to ≤150KB via `sharp`.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, ShadcnUI, NestJS, TypeORM, PostgreSQL, sharp (image compression), 9Router LLM (classification)

**Design Spec:** [`docs/superpowers/specs/2026-05-31-learning-hub-design.md`](../specs/2026-05-31-learning-hub-design.md)

---

## File Structure

### Backend — `backend/src/learnings/`

| File | Responsibility |
|---|---|
| `learning-topic.entity.ts` | TypeORM entity for `learning_topics` table |
| `learning-subtopic.entity.ts` | TypeORM entity for `learning_subtopics` table |
| `learning.entity.ts` | TypeORM entity for `learnings` table with relations |
| `learnings.controller.ts` | REST endpoints: list, detail, patch, add, upsert, topics, subtopics |
| `learnings.service.ts` | Business logic: CRUD, AI classification, image compression, dedup |
| `learnings.module.ts` | NestJS module definition |

### Backend — `backend/src/migrations/`

| File | Responsibility |
|---|---|
| `1717200001000-AddLearnings.ts` | Migration: create `learning_topics`, `learning_subtopics`, `learnings` tables + seed data |

### Frontend — `app/learning/`

| File | Responsibility |
|---|---|
| `app/learning/page.tsx` | Landing page (server component, metadata) |
| `app/learning/loading.tsx` | Loading skeleton |
| `app/learning/[id]/page.tsx` | Detail page (server component) |

### Frontend — `components/learning/`

| File | Responsibility |
|---|---|
| `LearningHeader.tsx` | Tabs + topic filter pills + subtopic chips + "Add Learning" button |
| `LearningCard.tsx` | Card component with image, title, badges, actions |
| `LearningGrid.tsx` | Grid layout + load-more pagination |
| `AddLearningDialog.tsx` | Modal for manual add (URL/image/text) |

### Frontend — `lib/api/`

| File | Responsibility |
|---|---|
| `learning-types.ts` | TypeScript interfaces for Learning, LearningTopic, LearningSubtopic |
| `learning-client.ts` | API client functions for learning endpoints |

---

## Task 1: Database Migration

**Files:**
- Create: `backend/src/migrations/1717200001000-AddLearnings.ts`
- Modify: `backend/src/data-source.ts` (add migration to list)

- [ ] **Step 1: Create migration file**

```typescript
// backend/src/migrations/1717200001000-AddLearnings.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLearnings1717200001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create learning_topics table
    await queryRunner.query(`
      CREATE TABLE "learning_topics" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR UNIQUE NOT NULL,
        "display_name" VARCHAR NOT NULL,
        "color" VARCHAR DEFAULT '#6366f1'
      );
    `);

    // Seed initial topics
    await queryRunner.query(`
      INSERT INTO "learning_topics" ("name", "display_name", "color") VALUES
        ('flutter', 'Flutter', '#027DFD'),
        ('android', 'Android', '#3DDC84');
    `);

    // 2. Create learning_subtopics table
    await queryRunner.query(`
      CREATE TABLE "learning_subtopics" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR UNIQUE NOT NULL,
        "display_name" VARCHAR NOT NULL
      );
    `);

    // Seed initial subtopics
    await queryRunner.query(`
      INSERT INTO "learning_subtopics" ("name", "display_name") VALUES
        ('navigation', 'Navigation'),
        ('state-management', 'State Management'),
        ('deeplink', 'Deep Link'),
        ('ui-widgets', 'UI & Widgets'),
        ('architecture', 'Architecture'),
        ('performance', 'Performance'),
        ('testing', 'Testing'),
        ('animations', 'Animations'),
        ('networking', 'Networking'),
        ('storage', 'Storage & Database'),
        ('dependency-injection', 'Dependency Injection'),
        ('ci-cd', 'CI/CD'),
        ('dart-language', 'Dart Language'),
        ('kotlin', 'Kotlin'),
        ('jetpack-compose', 'Jetpack Compose'),
        ('gradle', 'Gradle & Build'),
        ('security', 'Security'),
        ('accessibility', 'Accessibility'),
        ('platform-channels', 'Platform Channels'),
        ('other', 'Other');
    `);

    // 3. Create learnings table
    await queryRunner.query(`
      CREATE TABLE "learnings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "source_url" TEXT,
        "source_type" VARCHAR DEFAULT 'manual',
        "image_path" TEXT,
        "topic_id" INTEGER NOT NULL REFERENCES "learning_topics"("id") ON DELETE RESTRICT,
        "subtopic_id" INTEGER REFERENCES "learning_subtopics"("id") ON DELETE SET NULL,
        "is_learned" BOOLEAN DEFAULT FALSE,
        "is_favorite" BOOLEAN DEFAULT FALSE,
        "content_hash" VARCHAR UNIQUE,
        "analyze_status" VARCHAR DEFAULT 'idle',
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Create indexes
    await queryRunner.query(`CREATE INDEX idx_learnings_topic ON learnings(topic_id);`);
    await queryRunner.query(`CREATE INDEX idx_learnings_subtopic ON learnings(subtopic_id);`);
    await queryRunner.query(`CREATE INDEX idx_learnings_learned ON learnings(is_learned);`);
    await queryRunner.query(`CREATE INDEX idx_learnings_favorite ON learnings(is_favorite) WHERE is_favorite = TRUE;`);
    await queryRunner.query(`CREATE INDEX idx_learnings_created ON learnings(created_at DESC);`);
    await queryRunner.query(`CREATE INDEX idx_learnings_hash ON learnings(content_hash);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "learnings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_subtopics";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_topics";`);
  }
}
```

- [ ] **Step 2: Verify migration is picked up by data-source**

Check `backend/src/data-source.ts` — it should auto-discover migrations from the `migrations/` folder via glob pattern. If not, add the import manually.

- [ ] **Step 3: Commit**

```bash
git add backend/src/migrations/1717200001000-AddLearnings.ts
git commit -m "feat(learning): add database migration for learnings tables"
```

---

## Task 2: Backend Entities

**Files:**
- Create: `backend/src/learnings/learning-topic.entity.ts`
- Create: `backend/src/learnings/learning-subtopic.entity.ts`
- Create: `backend/src/learnings/learning.entity.ts`

- [ ] **Step 1: Create LearningTopicEntity**

```typescript
// backend/src/learnings/learning-topic.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LearningEntity } from './learning.entity';

@Entity('learning_topics')
export class LearningTopicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  display_name: string;

  @Column({ default: '#6366f1' })
  color: string;

  @OneToMany(() => LearningEntity, (learning) => learning.topic)
  learnings: LearningEntity[];
}
```

- [ ] **Step 2: Create LearningSubtopicEntity**

```typescript
// backend/src/learnings/learning-subtopic.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LearningEntity } from './learning.entity';

@Entity('learning_subtopics')
export class LearningSubtopicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  display_name: string;

  @OneToMany(() => LearningEntity, (learning) => learning.subtopic)
  learnings: LearningEntity[];
}
```

- [ ] **Step 3: Create LearningEntity**

```typescript
// backend/src/learnings/learning.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';

@Entity('learnings')
export class LearningEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text', nullable: true })
  source_url: string | null;

  @Column({ type: 'varchar', default: 'manual' })
  source_type: string;

  @Column({ type: 'text', nullable: true })
  image_path: string | null;

  @ManyToOne(() => LearningTopicEntity, (topic) => topic.learnings, {
    eager: true,
  })
  @JoinColumn({ name: 'topic_id' })
  topic: LearningTopicEntity;

  @ManyToOne(() => LearningSubtopicEntity, (sub) => sub.learnings, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'subtopic_id' })
  subtopic: LearningSubtopicEntity | null;

  @Column({ type: 'boolean', default: false })
  is_learned: boolean;

  @Column({ type: 'boolean', default: false })
  is_favorite: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  content_hash: string | null;

  @Column({ type: 'varchar', default: 'idle' })
  analyze_status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/learnings/
git commit -m "feat(learning): add TypeORM entities for learnings, topics, subtopics"
```

---

## Task 3: Backend Module, Service & Controller

**Files:**
- Create: `backend/src/learnings/learnings.module.ts`
- Create: `backend/src/learnings/learnings.service.ts`
- Create: `backend/src/learnings/learnings.controller.ts`
- Modify: `backend/src/app.module.ts` (import LearningsModule)

- [ ] **Step 1: Create LearningsModule**

```typescript
// backend/src/learnings/learnings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningEntity } from './learning.entity';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';
import { LearningsController } from './learnings.controller';
import { LearningsService } from './learnings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningEntity,
      LearningTopicEntity,
      LearningSubtopicEntity,
    ]),
  ],
  controllers: [LearningsController],
  providers: [LearningsService],
  exports: [LearningsService],
})
export class LearningsModule {}
```

- [ ] **Step 2: Create LearningsService**

This is the largest file. Key methods:
- `findAll()` — paginated list with tab/topic/subtopic filters
- `findOne()` — single learning by ID
- `patch()` — toggle is_learned, is_favorite, change subtopic
- `addManual()` — manual add with URL/image/text, AI analysis
- `upsert()` — batch upsert from Hermes cronjob
- `classifyLearning()` — AI subtopic classification (rule-based + LLM fallback)
- `compressImage()` — sharp compression to ≤150KB WebP
- `computeHash()` — SHA256 for dedup

```typescript
// backend/src/learnings/learnings.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';
import { LearningEntity } from './learning.entity';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';

const NINE_ROUTER_URL =
  process.env.NINE_ROUTER_URL || 'https://9router.phieucaphe.com/v1';
const NINE_ROUTER_MODEL =
  process.env.NINE_ROUTER_MODEL || 'gpt-4o-mini';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads';

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
      const uuid = crypto.randomUUID();
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
```

- [ ] **Step 3: Create LearningsController**

```typescript
// backend/src/learnings/learnings.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { LearningsService } from './learnings.service';

@Controller('api/learnings')
export class LearningsController {
  constructor(private readonly learningsService: LearningsService) {}

  @Get()
  findAll(
    @Query('tab') tab?: string,
    @Query('topic') topic?: string,
    @Query('subtopic') subtopic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.learningsService.findAll({
      tab,
      topic,
      subtopic,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('topics')
  findAllTopics() {
    return this.learningsService.findAllTopics();
  }

  @Get('subtopics')
  findAllSubtopics() {
    return this.learningsService.findAllSubtopics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningsService.findOne(id);
  }

  @Patch(':id')
  patch(
    @Param('id') id: string,
    @Body()
    body: {
      is_learned?: boolean;
      is_favorite?: boolean;
      subtopic_id?: number | null;
    },
  ) {
    return this.learningsService.patch(id, body);
  }

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  addManual(
    @Body() body: { url?: string; text?: string; topic?: string; title?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.learningsService.addManual({
      ...body,
      image: file?.buffer,
      imageFilename: file?.originalname,
    });
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(
    @Body()
    body: {
      learnings: {
        title: string;
        source_url: string;
        source_type?: string;
        topic?: string;
        description?: string;
      }[];
    },
  ) {
    return this.learningsService.upsert(body.learnings);
  }
}
```

- [ ] **Step 4: Register module in AppModule**

Modify `backend/src/app.module.ts` — add `LearningsModule` to imports array.

- [ ] **Step 5: Install sharp dependency**

```bash
cd backend && npm install sharp && npm install -D @types/multer
```

- [ ] **Step 6: Configure static file serving for uploads**

In `backend/src/main.ts`, add NestJS static serving for the `/uploads` path or configure it in `app.module.ts` using `ServeStaticModule`:

```typescript
// Add to app.module.ts imports:
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

ServeStaticModule.forRoot({
  rootPath: process.env.UPLOADS_DIR || '/app/uploads',
  serveRoot: '/uploads',
}),
```

Install: `cd backend && npm install @nestjs/serve-static`

- [ ] **Step 7: Build and verify**

```bash
cd backend && npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat(learning): add learnings module with service, controller, image compression"
```

---

## Task 4: Frontend Types & API Client

**Files:**
- Create: `lib/api/learning-types.ts`
- Create: `lib/api/learning-client.ts`

- [ ] **Step 1: Create learning types**

```typescript
// lib/api/learning-types.ts
export interface LearningTopic {
  id: number;
  name: string;
  display_name: string;
  color: string;
}

export interface LearningSubtopic {
  id: number;
  name: string;
  display_name: string;
}

export interface Learning {
  id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  source_type: string;
  image_path: string | null;
  topic: LearningTopic;
  subtopic: LearningSubtopic | null;
  is_learned: boolean;
  is_favorite: boolean;
  content_hash: string | null;
  analyze_status: 'idle' | 'analyzing' | 'done' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface LearningsResponse {
  data: Learning[];
  meta: {
    total: number;
    page: number;
    limit: number;
    tab: string;
  };
}
```

- [ ] **Step 2: Create learning API client**

```typescript
// lib/api/learning-client.ts
import type {
  Learning,
  LearningsResponse,
  LearningTopic,
  LearningSubtopic,
} from './learning-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export async function fetchLearnings(params: {
  tab?: string;
  topic?: string;
  subtopic?: string;
  page?: number;
  limit?: number;
}): Promise<LearningsResponse> {
  const searchParams = new URLSearchParams();
  if (params.tab) searchParams.set('tab', params.tab);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.subtopic) searchParams.set('subtopic', params.subtopic);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const res = await fetch(`${API_URL}/api/learnings?${searchParams}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch learnings');
  return res.json();
}

export async function fetchLearning(id: string): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch learning');
  return res.json();
}

export async function patchLearning(
  id: string,
  updates: {
    is_learned?: boolean;
    is_favorite?: boolean;
    subtopic_id?: number | null;
  },
): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to patch learning');
  return res.json();
}

export async function addLearning(formData: FormData): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/add`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add learning');
  return res.json();
}

export async function fetchTopics(): Promise<LearningTopic[]> {
  const res = await fetch(`${API_URL}/api/learnings/topics`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchSubtopics(): Promise<LearningSubtopic[]> {
  const res = await fetch(`${API_URL}/api/learnings/subtopics`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch subtopics');
  return res.json();
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/learning-types.ts lib/api/learning-client.ts
git commit -m "feat(learning): add frontend types and API client"
```

---

## Task 5: Frontend Components

**Files:**
- Create: `components/learning/LearningHeader.tsx`
- Create: `components/learning/LearningCard.tsx`
- Create: `components/learning/LearningGrid.tsx`
- Create: `components/learning/AddLearningDialog.tsx`

- [ ] **Step 1: Create LearningHeader**

Client component with tabs (To Learn / Learned / Favorites), topic filter pills (All / Flutter / Android), subtopic chips, and "Add Learning" button. Follow the same pattern as `components/dashboard/DashboardHeader.tsx` for styling consistency.

Key behaviors:
- Uses `useSearchParams` to read/write `tab`, `topic`, `subtopic` URL params
- Fetches topics from `/api/learnings/topics`
- Fetches subtopics from `/api/learnings/subtopics`
- Topic pills use the `color` field from the topic for badge styling

- [ ] **Step 2: Create LearningCard**

Client component displaying:
- Compressed image thumbnail (if `image_path` exists, load from `API_URL/uploads/{image_path}`)
- Title (truncated to 2 lines)
- Topic badge (Flutter blue #027DFD / Android green #3DDC84)
- Subtopic tag (e.g. "UI & Widgets")
- Source icon (LinkedIn/Medium/blog/manual icons)
- Relative time ("2 hours ago")
- Favorite toggle (heart icon)
- "Mark Learned" button (checkmark icon)
- Click → navigate to `/learning/[id]`

Follow the same card styling pattern as `components/dashboard/RepoCard.tsx`.

- [ ] **Step 3: Create LearningGrid**

Client component with:
- Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
- Load more button (20 items per batch, fetch next page and append)
- Empty state message per tab
- Loading skeleton during fetch

Follow the same pattern as `components/dashboard/RepoGrid.tsx`.

- [ ] **Step 4: Create AddLearningDialog**

Client component — ShadcnUI Dialog with:
- URL input field (paste a LinkedIn/Medium/blog URL)
- Image upload dropzone (drag-and-drop or click to select)
- Topic selector dropdown (Flutter / Android)
- Optional title field
- Submit button → calls `addLearning()` with FormData
- Shows loading state during submission
- On success: closes dialog, refreshes grid

- [ ] **Step 5: Commit**

```bash
git add components/learning/
git commit -m "feat(learning): add frontend components — header, card, grid, add dialog"
```

---

## Task 6: Frontend Pages

**Files:**
- Create: `app/learning/page.tsx`
- Create: `app/learning/loading.tsx`
- Create: `app/learning/[id]/page.tsx`

- [ ] **Step 1: Create learning landing page**

```typescript
// app/learning/page.tsx
import type { Metadata } from "next";
import LearningHeader from "@/components/learning/LearningHeader";
import LearningGrid from "@/components/learning/LearningGrid";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Learning Hub — ThangVQ",
  description:
    "Curated Flutter & Android learning content. Track your progress, favorite the best, never fall behind.",
};

export default async function LearningPage() {
  return (
    <main id="learning-main" className="min-h-screen">
      <LearningHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense>
          <LearningGrid />
        </Suspense>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create loading skeleton**

Follow the same pattern as `app/tech/loading.tsx`.

- [ ] **Step 3: Create learning detail page**

`app/learning/[id]/page.tsx` — Server component that:
- Fetches learning by ID
- Displays side-by-side: original image (full size from `source_url`) + AI Markdown summary
- Shows metadata: topic badge, subtopic tag, source link, created date
- Action buttons: Favorite toggle, "Mark as Learned" toggle, "Open Source" link (opens `source_url` in new tab)
- Subtopic dropdown editor (change classification)
- Renders Markdown summary with `react-markdown` + `remark-gfm` + `rehype-highlight` (same stack as TechTrend detail page)

- [ ] **Step 4: Commit**

```bash
git add app/learning/
git commit -m "feat(learning): add learning pages — landing and detail"
```

---

## Task 7: Navigation & Integration

**Files:**
- Modify: `app/layout.tsx` or navigation component (add `/learning` link)
- Modify: `docs/PRD.md` (add Learning Hub route and section)
- Modify: `CONTEXT.md` (add Learning Hub terminology)

- [ ] **Step 1: Add `/learning` to site navigation**

Add "Learning" link to the main navigation bar/header alongside Portfolio and TechTrend.

- [ ] **Step 2: Update PRD.md**

Add the `/learning` route to the Routes section and add a new "Part 3: Learning Hub" section with the feature summary and API routes.

- [ ] **Step 3: Update CONTEXT.md**

Add terminology:
- **Learning Hub** — Knowledge repository for Flutter & Android learnings scraped from LinkedIn, Medium, and official blogs.
- **Learning Subtopic** — AI-classified technical category (navigation, state-management, deeplink, etc.)

- [ ] **Step 4: Build and verify frontend**

```bash
npm run build
```

Expected: No build errors. Pages render correctly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(learning): integrate navigation, update PRD and CONTEXT"
```

---

## Task 8: Verify End-to-End

- [ ] **Step 1: Run backend locally**

```bash
cd infra && docker compose --env-file .env up -d postgres api
```

Verify migration runs and tables are created.

- [ ] **Step 2: Test API endpoints with curl**

```bash
# List learnings
curl http://localhost:3005/api/learnings

# List topics
curl http://localhost:3005/api/learnings/topics

# List subtopics
curl http://localhost:3005/api/learnings/subtopics

# Add manual learning via URL
curl -X POST http://localhost:3005/api/learnings/add \
  -F "url=https://medium.com/flutter/example-article" \
  -F "topic=flutter"

# Upsert (simulating Hermes)
curl -X POST http://localhost:3005/api/learnings/upsert \
  -H "x-api-key: <SYNC_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"learnings":[{"title":"Test Learning","source_url":"https://example.com/test","topic":"flutter"}]}'
```

- [ ] **Step 3: Test frontend**

```bash
npm run dev
```

Open `http://localhost:3002/learning` — verify:
- Landing page renders with tabs and filters
- Add Learning dialog works
- Card grid displays items correctly

- [ ] **Step 4: Run lint and build**

```bash
npm run lint && npm run build
cd backend && npm run lint && npm run build
```

Expected: No errors.
