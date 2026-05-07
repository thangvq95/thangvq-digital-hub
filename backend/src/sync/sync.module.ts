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
