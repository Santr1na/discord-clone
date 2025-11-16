import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendsRepository: Repository<Friend>,
    private usersService: UsersService,
  ) {}

  async sendFriendRequest(userId: number, friendId: number): Promise<Friend> {
    if (userId === friendId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const existing = await this.friendsRepository.findOne({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    const friend = this.friendsRepository.create({
      userId,
      friendId,
      status: 'pending',
    });

    return this.friendsRepository.save(friend);
  }

  async acceptFriendRequest(userId: number, friendId: number): Promise<Friend> {
    const friendRequest = await this.friendsRepository.findOne({
      where: { userId: friendId, friendId: userId, status: 'pending' },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.status = 'accepted';
    return this.friendsRepository.save(friendRequest);
  }

  async rejectFriendRequest(userId: number, friendId: number): Promise<void> {
    const friendRequest = await this.friendsRepository.findOne({
      where: { userId: friendId, friendId: userId, status: 'pending' },
    });

    if (friendRequest) {
      await this.friendsRepository.remove(friendRequest);
    }
  }

  async getFriends(userId: number): Promise<any[]> {
    const friends = await this.friendsRepository.find({
      where: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
      relations: ['user', 'friend'],
    });

    return friends.map((f) => {
      const friendUser = f.userId === userId ? f.friend : f.user;
      return {
        id: friendUser.id,
        username: friendUser.username,
        email: friendUser.email,
        avatar: friendUser.avatar,
        status: friendUser.status,
        friendRequestId: f.id,
      };
    });
  }

  async getPendingRequests(userId: number): Promise<any[]> {
    const requests = await this.friendsRepository.find({
      where: { friendId: userId, status: 'pending' },
      relations: ['user'],
    });

    return requests.map((r) => ({
      id: r.user.id,
      username: r.user.username,
      email: r.user.email,
      avatar: r.user.avatar,
      status: r.user.status,
      friendRequestId: r.id,
    }));
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    const friend = await this.friendsRepository.findOne({
      where: [
        { userId, friendId, status: 'accepted' },
        { userId: friendId, friendId: userId, status: 'accepted' },
      ],
    });

    if (friend) {
      await this.friendsRepository.remove(friend);
    }
  }
}

