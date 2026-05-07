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

  @Column()
  html_url: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'int', nullable: true })
  rank_daily: number;

  @Column({ type: 'int', nullable: true })
  rank_weekly: number;

  @Column({ type: 'int', nullable: true })
  rank_monthly: number;

  @Column({ type: 'int', default: 0 })
  stars_total: number;

  @Column({ nullable: true })
  stars_growth: string;

  @Column({ type: 'int', default: 0 })
  forks_total: number;

  @Column('text', { array: true, default: '{}' })
  domains: string[];

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  is_applied: boolean;

  @Column({ default: false })
  is_viewed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  viewed_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_release_checked_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  first_seen_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_ranked_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
