import { Controller, Get, Post, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get()
  async getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @Get('pending')
  async getPendingRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.userId);
  }

  @Post('request')
  async sendFriendRequest(@Request() req, @Body('friendId') friendId: number) {
    return this.friendsService.sendFriendRequest(req.user.userId, friendId);
  }

  @Post('accept/:friendId')
  async acceptFriendRequest(@Request() req, @Param('friendId') friendId: number) {
    return this.friendsService.acceptFriendRequest(req.user.userId, friendId);
  }

  @Post('reject/:friendId')
  async rejectFriendRequest(@Request() req, @Param('friendId') friendId: number) {
    await this.friendsService.rejectFriendRequest(req.user.userId, friendId);
    return { success: true };
  }

  @Delete(':friendId')
  async removeFriend(@Request() req, @Param('friendId') friendId: number) {
    await this.friendsService.removeFriend(req.user.userId, friendId);
    return { success: true };
  }
}

