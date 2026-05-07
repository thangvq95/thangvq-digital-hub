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
  NotFoundException,
} from '@nestjs/common';
import { ReposService } from './repos.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { RepositoryEntity } from './repository.entity';

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
    return this.reposService.findAll({
      period,
      domain,
      fav: fav === 'true',
      q,
    });
  }

  @Get(':fullName')
  async findOne(@Param('fullName') fullName: string) {
    const repo = await this.reposService.findOne(decodeURIComponent(fullName));
    if (!repo) throw new NotFoundException('Repository not found');
    return repo;
  }

  @Patch(':fullName')
  patch(
    @Param('fullName') fullName: string,
    @Body()
    body: Partial<Pick<RepositoryEntity, 'is_favorite' | 'is_applied' | 'is_viewed' | 'notes'>>,
  ) {
    return this.reposService.patch(decodeURIComponent(fullName), body);
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(
    @Body()
    body: {
      sync_type: string;
      repositories: Partial<RepositoryEntity>[];
    },
  ) {
    return this.reposService.upsert(body.sync_type, body.repositories);
  }
}
