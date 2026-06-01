import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LearningEntity } from './learning.entity';

@Entity('learning_subtopics')
export class LearningSubtopicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  display_name: string;

  @OneToMany(() => LearningEntity, (learning) => learning.subtopic)
  learnings: LearningEntity[];
}
