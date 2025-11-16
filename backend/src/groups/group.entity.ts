import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  ownerId: number;

  @Column({ nullable: true })
  avatar: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'group_members',
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @CreateDateColumn()
  createdAt: Date;
}

