// backend/src/repos/repos.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReposService } from './repos.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { RepositoryEntity } from './repository.entity';

@Controller('api/repos')
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  @Get()
  findAll(
    @Query('tab') tab?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.reposService.findAll(
      tab ?? 'all',
      Number(page) || 1,
      Number(limit) || 20,
      category,
    );
  }

  @Get(':fullName')
  findOne(@Param('fullName') fullName: string) {
    return this.reposService.findOne(decodeURIComponent(fullName));
  }

  @Patch(':fullName')
  patch(
    @Param('fullName') fullName: string,
    @Body()
    body: {
      is_favorite?: boolean;
      is_archived?: boolean;
      has_new_release?: boolean;
      is_read?: boolean;
      category_id?: number | null;
    },
  ) {
    return this.reposService.patch(decodeURIComponent(fullName), body);
  }

  @Post(':fullName/analyze')
  analyze(@Param('fullName') fullName: string) {
    return this.reposService.triggerAnalyze(decodeURIComponent(fullName));
  }

  @Post(':fullName/sync-release')
  syncRelease(@Param('fullName') fullName: string) {
    return this.reposService.syncRelease(decodeURIComponent(fullName));
  }

  @Post('classify-all')
  @UseGuards(ApiKeyGuard)
  classifyAll() {
    return this.reposService.classifyAllRepos();
  }

  @Post('add')
  addRepo(@Body() body: { url: string }) {
    if (!body.url) throw new Error('URL is required');
    return this.reposService.addManualRepo(body.url);
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: unknown) {
    let repos: unknown[] = [];
    if (Array.isArray(body)) {
      repos = body;
    } else if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const candidates = obj.repositories || obj.repos;
      if (Array.isArray(candidates)) {
        repos = candidates;
      }
    }
    return this.reposService.upsert(repos as Partial<RepositoryEntity>[]);
  }

  @Post('check-releases')
  @UseGuards(ApiKeyGuard)
  checkReleases(@Body() body: unknown) {
    let releases: unknown[] = [];
    if (Array.isArray(body)) {
      releases = body;
    } else if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const candidates = obj.releases;
      if (Array.isArray(candidates)) {
        releases = candidates;
      }
    }
    return this.reposService.checkReleases(
      releases as { full_name: string; tag_name: string }[],
    );
  }
}

@Controller('api')
export class ReposCompatController {
  constructor(private readonly reposService: ReposService) {}

  @Post(['github/trending/repo', 'github/trending/repos'])
  @UseGuards(ApiKeyGuard)
  upsertCompat(@Body() body: unknown) {
    let repos: unknown[] = [];
    if (Array.isArray(body)) {
      repos = body;
    } else if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const candidates = obj.repositories || obj.repos;
      if (Array.isArray(candidates)) {
        repos = candidates;
      }
    }
    return this.reposService.upsert(repos as Partial<RepositoryEntity>[]);
  }
}
