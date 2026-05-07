// backend/src/releases/repo-release.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('repo_releases')
@Unique(['repo_full_name', 'release_tag'])
export class RepoReleaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  repo_full_name: string;

  @Column()
  release_tag: string;

  @Column({ nullable: true })
  release_title: string;

  @Column({ nullable: true })
  release_url: string;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date;

  @Column({ type: 'text', nullable: true })
  changelog_raw: string;

  @Column({ nullable: true })
  release_body_hash: string;

  @Column({ type: 'text', nullable: true })
  ai_summary: string;

  @Column({ type: 'text', nullable: true })
  breaking_changes: string;

  @Column({ type: 'text', nullable: true })
  migration_notes: string;

  @Column({ type: 'smallint', nullable: true })
  relevance_score: number;

  @Column({ default: false })
  is_viewed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  processed_at: Date;
}
