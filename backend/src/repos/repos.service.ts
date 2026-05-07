// backend/src/repos/repos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryEntity } from './repository.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(RepositoryEntity)
    private readonly repo: Repository<RepositoryEntity>,
  ) {}

  async findAll(filters: {
    period?: string;
    domain?: string;
    fav?: boolean;
    q?: string;
  }) {
    const qb = this.repo.createQueryBuilder('r');

    if (filters.period === 'daily') {
      qb.andWhere('r.rank_daily IS NOT NULL').orderBy('r.rank_daily', 'ASC');
    } else if (filters.period === 'weekly') {
      qb.andWhere('r.rank_weekly IS NOT NULL').orderBy('r.rank_weekly', 'ASC');
    } else if (filters.period === 'monthly') {
      qb.andWhere('r.rank_monthly IS NOT NULL').orderBy('r.rank_monthly', 'ASC');
    } else {
      qb.orderBy('r.updated_at', 'DESC');
    }

    if (filters.domain) {
      qb.andWhere(':domain = ANY(r.domains)', { domain: filters.domain });
    }
    if (filters.fav) {
      qb.andWhere('r.is_favorite = true');
    }
    if (filters.q) {
      qb.andWhere(
        '(r.full_name ILIKE :q OR r.description ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, period: filters.period ?? 'all' } };
  }

  async findOne(fullName: string) {
    return this.repo.findOneBy({ full_name: fullName });
  }

  async patch(
    fullName: string,
    updates: Partial<
      Pick<RepositoryEntity, 'is_favorite' | 'is_applied' | 'is_viewed' | 'notes'>
    >,
  ) {
    await this.repo.update({ full_name: fullName }, updates);
    return this.repo.findOneBy({ full_name: fullName });
  }

  async upsert(
    syncType: string,
    repos: Partial<RepositoryEntity>[],
  ): Promise<{ received: number; new: number }> {
    // Reset ranks by sync type (NULL out so old entries don't retain stale ranks)
    if (syncType === 'daily') {
      await this.repo.query('UPDATE repositories SET rank_daily = NULL');
    } else if (syncType === 'weekly') {
      await this.repo.query('UPDATE repositories SET rank_weekly = NULL');
    } else if (syncType === 'monthly') {
      await this.repo.query('UPDATE repositories SET rank_monthly = NULL');
    } else if (syncType === 'full') {
      await this.repo.query(
        'UPDATE repositories SET rank_daily = NULL, rank_weekly = NULL, rank_monthly = NULL',
      );
    }

    let newCount = 0;
    for (const r of repos) {
      const existing = await this.repo.findOneBy({ full_name: r.full_name });
      if (!existing) {
        await this.repo.save({ ...r, is_viewed: false });
        newCount++;
      } else {
        // Preserve user fields: is_favorite, is_applied, is_viewed, viewed_at, notes, first_seen_at
        const { is_favorite, is_applied, is_viewed, viewed_at, notes, first_seen_at, ...syncFields } = r as RepositoryEntity;
        void is_favorite; void is_applied; void is_viewed; void viewed_at; void notes; void first_seen_at;
        await this.repo.update(
          { full_name: r.full_name },
          { ...syncFields, last_ranked_at: new Date() },
        );
      }
    }
    return { received: repos.length, new: newCount };
  }
}
