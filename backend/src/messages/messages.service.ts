import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create(messageData);
    return this.messagesRepository.save(message);
  }

  async getDirectMessages(userId: number, friendId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async getGroupMessages(groupId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { groupId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}

