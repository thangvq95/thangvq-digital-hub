import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LearningEntity } from './learning.entity';

@Entity('learning_topics')
export class LearningTopicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  display_name: string;

  @Column({ default: '#6366f1' })
  color: string;

  @OneToMany(() => LearningEntity, (learning) => learning.topic)
  learnings: LearningEntity[];
}
