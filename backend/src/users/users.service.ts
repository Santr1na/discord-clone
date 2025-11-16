import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async searchUsers(query: string, excludeUserId: number): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :query', { query: `%${query}%` })
      .orWhere('user.email LIKE :query', { query: `%${query}%` })
      .andWhere('user.id != :excludeUserId', { excludeUserId })
      .limit(20)
      .getMany();
  }

  async updateStatus(userId: number, status: string): Promise<void> {
    await this.usersRepository.update(userId, { status });
  }

  async update(userId: number, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(userId, updateData);
    return this.findOne(userId);
  }
}

