// backend/src/repos/repository.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('repositories')
export class RepositoryEntity {
  @PrimaryColumn()
  full_name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ unique: true })
  html_url: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'int', default: 0 })
  stars_total: number;

  @Column({ nullable: true })
  stars_growth: string;

  @Column({ type: 'int', default: 0 })
  forks_total: number;

  @Column({ type: 'smallint', nullable: true })
  trending_rank: number;

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ type: 'text', nullable: true })
  latest_release_tag: string | null;

  @Column({ type: 'text', nullable: true })
  latest_release_body: string | null;

  @Column({ default: false })
  has_new_release: boolean;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'text', nullable: true })
  ai_summary: string;

  /** 'idle' | 'analyzing' | 'done' | 'failed' */
  @Column({ default: 'idle' })
  analyze_status: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  first_seen_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_scraped_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
