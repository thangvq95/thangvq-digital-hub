import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RepositoryEntity } from './repository.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => RepositoryEntity, (repo) => repo.category)
  repositories: RepositoryEntity[];
}
