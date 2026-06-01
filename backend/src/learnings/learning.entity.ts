import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LearningTopicEntity } from './learning-topic.entity';
import { LearningSubtopicEntity } from './learning-subtopic.entity';

@Entity('learnings')
export class LearningEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text', nullable: true })
  source_url: string | null;

  @Column({ type: 'varchar', default: 'manual' })
  source_type: string;

  @Column({ type: 'text', nullable: true })
  image_path: string | null;

  @ManyToOne(() => LearningTopicEntity, (topic) => topic.learnings, {
    eager: true,
  })
  @JoinColumn({ name: 'topic_id' })
  topic: LearningTopicEntity;

  @ManyToOne(() => LearningSubtopicEntity, (sub) => sub.learnings, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'subtopic_id' })
  subtopic: LearningSubtopicEntity | null;

  @Column({ type: 'boolean', default: false })
  is_learned: boolean;

  @Column({ type: 'boolean', default: false })
  is_favorite: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  content_hash: string | null;

  @Column({ type: 'varchar', default: 'idle' })
  analyze_status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
