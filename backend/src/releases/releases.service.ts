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

  async upsert(
    releases: Partial<RepoReleaseEntity>[],
  ): Promise<{ received: number; inserted: number }> {
    let inserted = 0;
    for (const r of releases) {
      const existing = await this.repo.findOneBy({
        repo_full_name: r.repo_full_name,
        release_tag: r.release_tag,
      });
      if (!existing) {
        await this.repo.save(r);
        inserted++;
      } else if (
        r.release_body_hash &&
        r.release_body_hash !== existing.release_body_hash
      ) {
        // Re-analyze: release notes were edited
        await this.repo.update(existing.id, r);
      }
    }
    return { received: releases.length, inserted };
  }
}
