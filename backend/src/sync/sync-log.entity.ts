// backend/src/sync/sync-log.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('sync_logs')
export class SyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sync_type: string;

  @Column({ type: 'int', default: 0 })
  repos_scraped: number;

  @Column({ type: 'int', default: 0 })
  repos_new: number;

  @Column({ type: 'int', default: 0 })
  repos_classified: number;

  @Column({ default: 'running' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date;
}
