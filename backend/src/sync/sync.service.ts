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

  async getLatest(): Promise<SyncLogEntity | null> {
    return this.repo.findOne({ where: {}, order: { started_at: 'DESC' } });
  }

  async create(): Promise<SyncLogEntity> {
    return this.repo.save({ status: 'running' });
  }

  async complete(
    id: string,
    counts: { repos_scraped: number; repos_new: number },
  ) {
    return this.repo.update(id, {
      ...counts,
      status: 'success',
      completed_at: new Date(),
    });
  }

  async fail(id: string, error: string) {
    return this.repo.update(id, {
      status: 'failed',
      error_message: error,
      completed_at: new Date(),
    });
  }
}
