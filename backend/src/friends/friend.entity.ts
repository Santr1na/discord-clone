import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  friendId: number;

  @Column({ default: 'pending' })
  status: string; // pending, accepted, blocked

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @CreateDateColumn()
  createdAt: Date;
}

