# NestJS Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up a NestJS API with PostgreSQL on Docker, implementing all endpoints from the PRD (`/api/repos`, `/api/releases`, `/api/sync`).

**Architecture:** NestJS app in `backend/` directory. PostgreSQL via Docker Compose. TypeORM for database access. API key auth for Hermes-only endpoints. Frontend (Vercel) calls this API via `NEXT_PUBLIC_API_URL`.

**Tech Stack:** NestJS, TypeORM, PostgreSQL 16, Docker Compose, class-validator

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `backend/` | NestJS app root |
| Create | `backend/src/app.module.ts` | Root module |
| Create | `backend/src/main.ts` | Bootstrap + CORS |
| Create | `backend/src/repos/` | Repos module (entity, service, controller) |
| Create | `backend/src/releases/` | Releases module |
| Create | `backend/src/sync/` | Sync logs module |
| Create | `backend/src/auth/` | API key guard |
| Modify | `infra/docker-compose.yml` | Add postgres + nestjs services |

---

### Task 1: Scaffold NestJS App + Docker Compose

- [x] **Step 1: Initialize NestJS project**

```bash
cd /Users/thang/Documents/thangvq-digital-hub
npx -y @nestjs/cli@latest new backend --package-manager npm --skip-git --strict
```

- [x] **Step 2: Install dependencies**

```bash
cd backend
npm install @nestjs/typeorm typeorm pg class-validator class-transformer
npm install -D @types/pg
```

- [x] **Step 3: Update `infra/docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: digitalhub-postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: digitalhub
      POSTGRES_USER: digitalhub
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpassword}
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: digitalhub-api
    restart: always
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgres://digitalhub:${POSTGRES_PASSWORD:-devpassword}@postgres:5432/digitalhub
      SYNC_API_KEY: ${SYNC_API_KEY}
      PORT: 3001
    depends_on:
      - postgres

  ai-workspace:
    build:
      context: ../
      dockerfile: infra/ai-developer-workspace/Dockerfile
    container_name: ai-developer-workspace
    restart: always
    ports:
      - "${PORT:-8080}:8080"
    volumes:
      - ../:/app/repo
      - listener_data:/app/data
      - ~/.hermes:/root/.hermes
      - ~/.ssh:/root/.ssh:ro
      - ~/.config/gh:/root/.config/gh:ro
    environment:
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - BASE_REPO=${BASE_REPO:-/app/repo}
      - WORKTREES_DIR=${WORKTREES_DIR:-/app/worktrees}
      - DEDUP_DB=${DEDUP_DB:-/app/data/ai-workspace.db}
      - PORT=${PORT:-8080}
      - HERMES_BIN=${HERMES_BIN:-hermes}

volumes:
  pgdata:
  listener_data:
```

- [x] **Step 4: Create `backend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
```

- [x] **Step 5: Commit**

```bash
git add backend/ infra/docker-compose.yml
git commit -m "feat(backend): scaffold NestJS app + Docker Compose with PostgreSQL"
```

---

### Task 2: Database Entities + TypeORM Setup

- [x] **Step 1: Configure TypeORM in `backend/src/app.module.ts`**

```ts
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposModule } from './repos/repos.module';
import { ReleasesModule } from './releases/releases.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    ReposModule,
    ReleasesModule,
    SyncModule,
  ],
})
export class AppModule {}
```

- [x] **Step 2: Create Repository entity**

```ts
// backend/src/repos/repository.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('repositories')
export class RepositoryEntity {
  @PrimaryColumn()
  full_name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  html_url: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'int', nullable: true })
  rank_daily: number;

  @Column({ type: 'int', nullable: true })
  rank_weekly: number;

  @Column({ type: 'int', nullable: true })
  rank_monthly: number;

  @Column({ type: 'int', default: 0 })
  stars_total: number;

  @Column({ nullable: true })
  stars_growth: string;

  @Column({ type: 'int', default: 0 })
  forks_total: number;

  @Column('text', { array: true, default: '{}' })
  domains: string[];

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_applied: boolean;

  @Column({ default: false })
  is_viewed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  viewed_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_release_checked_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  first_seen_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_ranked_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

- [x] **Step 3: Create RepoRelease entity**

```ts
// backend/src/releases/repo-release.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('repo_releases')
@Unique(['repo_full_name', 'release_tag'])
export class RepoReleaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  repo_full_name: string;

  @Column()
  release_tag: string;

  @Column({ nullable: true })
  release_title: string;

  @Column({ nullable: true })
  release_url: string;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date;

  @Column({ type: 'text', nullable: true })
  changelog_raw: string;

  @Column({ nullable: true })
  release_body_hash: string;

  @Column({ type: 'text', nullable: true })
  ai_summary: string;

  @Column({ type: 'text', nullable: true })
  breaking_changes: string;

  @Column({ type: 'text', nullable: true })
  migration_notes: string;

  @Column({ type: 'smallint', nullable: true })
  relevance_score: number;

  @Column({ default: false })
  is_viewed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  processed_at: Date;
}
```

- [x] **Step 4: Create SyncLog entity**

```ts
// backend/src/sync/sync-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sync_logs')
export class SyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sync_type: string;

  @Column({ type: 'int', default: 0 })
  repos_scraped: number;

  @Column({ type: 'int', default: 0 })
  repos_new: number;

  @Column({ type: 'int', default: 0 })
  repos_classified: number;

  @Column({ default: 'running' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date;
}
```

- [x] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat(backend): add TypeORM entities for repositories, releases, sync_logs"
```

---

### Task 3: API Key Guard

- [x] **Step 1: Create API key guard**

```ts
// backend/src/auth/api-key.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
```

- [x] **Step 2: Commit**

```bash
git add backend/src/auth/
git commit -m "feat(backend): add API key guard for Hermes-only endpoints"
```

---

### Task 4: Repos Module (GET list, GET detail, PATCH, POST upsert)

- [x] **Step 1: Create repos service**

```ts
// backend/src/repos/repos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull, Not } from 'typeorm';
import { RepositoryEntity } from './repository.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(RepositoryEntity)
    private readonly repo: Repository<RepositoryEntity>,
  ) {}

  async findAll(filters: { period?: string; domain?: string; fav?: boolean; q?: string }) {
    const qb = this.repo.createQueryBuilder('r');

    if (filters.period === 'daily') qb.andWhere('r.rank_daily IS NOT NULL').orderBy('r.rank_daily', 'ASC');
    else if (filters.period === 'weekly') qb.andWhere('r.rank_weekly IS NOT NULL').orderBy('r.rank_weekly', 'ASC');
    else if (filters.period === 'monthly') qb.andWhere('r.rank_monthly IS NOT NULL').orderBy('r.rank_monthly', 'ASC');
    else qb.orderBy('r.updated_at', 'DESC');

    if (filters.domain) qb.andWhere(':domain = ANY(r.domains)', { domain: filters.domain });
    if (filters.fav) qb.andWhere('r.is_favorite = true');
    if (filters.q) qb.andWhere('(r.full_name ILIKE :q OR r.description ILIKE :q)', { q: `%${filters.q}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, period: filters.period ?? 'all' } };
  }

  async findOne(fullName: string) {
    return this.repo.findOneBy({ full_name: fullName });
  }

  async patch(fullName: string, updates: Partial<Pick<RepositoryEntity, 'is_favorite' | 'is_applied' | 'is_viewed' | 'notes'>>) {
    await this.repo.update({ full_name: fullName }, updates);
    return this.repo.findOneBy({ full_name: fullName });
  }

  async upsert(syncType: string, repos: Partial<RepositoryEntity>[]) {
    // Reset ranks by sync type
    if (syncType === 'daily') await this.repo.update({}, { rank_daily: undefined });
    else if (syncType === 'weekly') await this.repo.update({}, { rank_weekly: undefined });
    else if (syncType === 'monthly') await this.repo.update({}, { rank_monthly: undefined });

    let newCount = 0;
    for (const r of repos) {
      const existing = await this.repo.findOneBy({ full_name: r.full_name });
      if (!existing) {
        await this.repo.save({ ...r, is_viewed: false });
        newCount++;
      } else {
        // Preserve user fields
        const { is_favorite, is_applied, is_viewed, viewed_at, notes, first_seen_at, ...rest } = r as any;
        await this.repo.update({ full_name: r.full_name }, { ...rest, last_ranked_at: new Date() });
      }
    }
    return { received: repos.length, new: newCount };
  }
}
```

- [x] **Step 2: Create repos controller**

```ts
// backend/src/repos/repos.controller.ts
import { Controller, Get, Patch, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ReposService } from './repos.service';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller('api/repos')
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  @Get()
  findAll(
    @Query('period') period?: string,
    @Query('domain') domain?: string,
    @Query('fav') fav?: string,
    @Query('q') q?: string,
  ) {
    return this.reposService.findAll({ period, domain, fav: fav === 'true', q });
  }

  @Get(':fullName')
  findOne(@Param('fullName') fullName: string) {
    return this.reposService.findOne(decodeURIComponent(fullName));
  }

  @Patch(':fullName')
  patch(@Param('fullName') fullName: string, @Body() body: Record<string, any>) {
    return this.reposService.patch(decodeURIComponent(fullName), body);
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: { sync_type: string; repositories: any[] }) {
    return this.reposService.upsert(body.sync_type, body.repositories);
  }
}
```

- [x] **Step 3: Create repos module**

```ts
// backend/src/repos/repos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryEntity } from './repository.entity';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepositoryEntity])],
  controllers: [ReposController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
```

- [x] **Step 4: Commit**

```bash
git add backend/src/repos/
git commit -m "feat(backend): implement repos module — list, detail, patch, upsert"
```

---

### Task 5: Releases Module + Sync Module

- [x] **Step 1: Create releases service + controller + module**

```ts
// backend/src/releases/releases.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepoReleaseEntity } from './repo-release.entity';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(RepoReleaseEntity)
    private readonly repo: Repository<RepoReleaseEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      order: { published_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async upsert(releases: Partial<RepoReleaseEntity>[]) {
    let inserted = 0;
    for (const r of releases) {
      const existing = await this.repo.findOneBy({
        repo_full_name: r.repo_full_name,
        release_tag: r.release_tag,
      });
      if (!existing) {
        await this.repo.save(r);
        inserted++;
      } else if (r.release_body_hash && r.release_body_hash !== existing.release_body_hash) {
        await this.repo.update(existing.id, r);
      }
    }
    return { received: releases.length, inserted };
  }
}
```

```ts
// backend/src/releases/releases.controller.ts
import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller('api/releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.releasesService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: { releases: any[] }) {
    return this.releasesService.upsert(body.releases);
  }
}
```

```ts
// backend/src/releases/releases.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepoReleaseEntity } from './repo-release.entity';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepoReleaseEntity])],
  controllers: [ReleasesController],
  providers: [ReleasesService],
})
export class ReleasesModule {}
```

- [x] **Step 2: Create sync service + controller + module**

```ts
// backend/src/sync/sync.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncLogEntity } from './sync-log.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncLogEntity)
    private readonly repo: Repository<SyncLogEntity>,
  ) {}

  async getLatest() {
    return this.repo.findOne({ order: { started_at: 'DESC' } });
  }

  async create(syncType: string) {
    return this.repo.save({ sync_type: syncType, status: 'running' });
  }

  async complete(id: string, counts: { repos_scraped: number; repos_new: number; repos_classified: number }) {
    return this.repo.update(id, { ...counts, status: 'success', completed_at: new Date() });
  }

  async fail(id: string, error: string) {
    return this.repo.update(id, { status: 'failed', error_message: error, completed_at: new Date() });
  }
}
```

```ts
// backend/src/sync/sync.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  getLatest() {
    return this.syncService.getLatest();
  }
}
```

```ts
// backend/src/sync/sync.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncLogEntity } from './sync-log.entity';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncLogEntity])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
```

- [x] **Step 3: Commit**

```bash
git add backend/src/releases/ backend/src/sync/
git commit -m "feat(backend): implement releases + sync modules"
```

---

### Task 6: Bootstrap + CORS + Validation

- [x] **Step 1: Update `backend/src/main.ts`**

```ts
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://thangvq95.page',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3001);
  console.log(`API running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
```

- [x] **Step 2: Verify build**

```bash
cd backend && npm run build
```

Expected: Compiles without errors.

- [x] **Step 3: Commit**

```bash
git add backend/src/main.ts
git commit -m "feat(backend): configure CORS, validation pipe, bootstrap"
```

---

### Task 7: Docker Compose Smoke Test

- [x] **Step 1: Start services**

```bash
cd infra && docker compose up -d postgres api
```

- [x] **Step 2: Wait for startup then test health**

```bash
sleep 5
curl -s http://localhost:3001/api/sync | head
curl -s http://localhost:3001/api/repos | head
```

Expected: JSON responses (empty data, no errors).

- [x] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat(backend): complete Phase 1 NestJS API — all endpoints, Docker Compose ready"
```
