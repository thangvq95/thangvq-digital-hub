// backend/src/releases/releases.controller.ts
import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { RepoReleaseEntity } from './repo-release.entity';

@Controller('api/releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.releasesService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: { releases: Partial<RepoReleaseEntity>[] }) {
    return this.releasesService.upsert(body.releases);
  }
}
