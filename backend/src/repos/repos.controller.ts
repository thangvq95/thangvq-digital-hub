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
  ) {
    return this.reposService.findAll(
      tab ?? 'all',
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(':fullName')
  findOne(@Param('fullName') fullName: string) {
    return this.reposService.findOne(decodeURIComponent(fullName));
  }

  @Patch(':fullName')
  patch(
    @Param('fullName') fullName: string,
    @Body() body: { is_favorite?: boolean; is_archived?: boolean; has_new_release?: boolean; is_read?: boolean },
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

  @Post('add')
  addRepo(@Body() body: { url: string }) {
    if (!body.url) throw new Error('URL is required');
    return this.reposService.addManualRepo(body.url);
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: { repositories: Partial<RepositoryEntity>[] }) {
    return this.reposService.upsert(body.repositories);
  }

  @Post('check-releases')
  @UseGuards(ApiKeyGuard)
  checkReleases(
    @Body() body: { releases: { full_name: string; tag_name: string }[] },
  ) {
    return this.reposService.checkReleases(body.releases);
  }
}

@Controller('api')
export class ReposCompatController {
  constructor(private readonly reposService: ReposService) {}

  @Post(['github/trending/repo', 'github/trending/repos'])
  @UseGuards(ApiKeyGuard)
  upsertCompat(@Body() body: { repositories: Partial<RepositoryEntity>[] }) {
    return this.reposService.upsert(body.repositories);
  }
}

