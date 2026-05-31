// backend/src/repos/repos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryEntity } from './repository.entity';
import { CategoryEntity } from './category.entity';
import { ReposController, ReposCompatController } from './repos.controller';
import { CategoriesController } from './categories.controller';
import { ReposService } from './repos.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepositoryEntity, CategoryEntity])],
  controllers: [ReposController, ReposCompatController, CategoriesController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
