import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningEntity } from './learning.entity';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';
import { LearningsController } from './learnings.controller';
import { LearningsService } from './learnings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningEntity,
      LearningTopicEntity,
      LearningSubtopicEntity,
    ]),
  ],
  controllers: [LearningsController],
  providers: [LearningsService],
  exports: [LearningsService],
})
export class LearningsModule {}
