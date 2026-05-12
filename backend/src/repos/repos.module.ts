// backend/src/repos/repos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryEntity } from './repository.entity';
import { ReposController, ReposCompatController } from './repos.controller';
import { ReposService } from './repos.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepositoryEntity])],
  controllers: [ReposController, ReposCompatController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
