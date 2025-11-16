import { Controller, Get, UseGuards, Request, Put, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Request() req, @Query('query') query: string) {
    return this.usersService.searchUsers(query, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('status')
  async updateStatus(@Request() req, @Body('status') status: string) {
    await this.usersService.updateStatus(req.user.userId, status);
    return { success: true };
  }
}

