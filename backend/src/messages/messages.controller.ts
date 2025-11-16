import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async createMessage(@Request() req, @Body() messageData: any) {
    return this.messagesService.createMessage({
      ...messageData,
      senderId: req.user.userId,
    });
  }

  @Get('direct/:friendId')
  async getDirectMessages(@Request() req, @Param('friendId') friendId: number) {
    return this.messagesService.getDirectMessages(req.user.userId, friendId);
  }

  @Get('group/:groupId')
  async getGroupMessages(@Param('groupId') groupId: number) {
    return this.messagesService.getGroupMessages(groupId);
  }
}

