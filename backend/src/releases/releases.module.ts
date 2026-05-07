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
