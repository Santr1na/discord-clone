import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private usersService: UsersService,
  ) {}

  async createGroup(groupData: Partial<Group>, ownerId: number): Promise<Group> {
    const group = this.groupsRepository.create({
      ...groupData,
      ownerId,
    });
    const savedGroup = await this.groupsRepository.save(group);
    
    // Add owner as member
    const owner = await this.usersService.findOne(ownerId);
    savedGroup.members = [owner];
    return this.groupsRepository.save(savedGroup);
  }

  async getGroups(userId: number): Promise<Group[]> {
    return this.groupsRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .where('member.id = :userId', { userId })
      .getMany();
  }

  async getGroup(groupId: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async addMember(groupId: number, userId: number): Promise<Group> {
    const group = await this.getGroup(groupId);
    const user = await this.usersService.findOne(userId);

    if (!group.members.find(m => m.id === userId)) {
      group.members.push(user);
      return this.groupsRepository.save(group);
    }

    return group;
  }

  async removeMember(groupId: number, userId: number): Promise<Group> {
    const group = await this.getGroup(groupId);
    group.members = group.members.filter(m => m.id !== userId);
    return this.groupsRepository.save(group);
  }

  async deleteGroup(groupId: number, ownerId: number): Promise<void> {
    const group = await this.getGroup(groupId);
    if (group.ownerId !== ownerId) {
      throw new NotFoundException('Only owner can delete group');
    }
    await this.groupsRepository.remove(group);
  }
}

