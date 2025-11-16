import { Controller, Get, Post, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  async createGroup(@Request() req, @Body() groupData: any) {
    return this.groupsService.createGroup(groupData, req.user.userId);
  }

  @Get()
  async getGroups(@Request() req) {
    return this.groupsService.getGroups(req.user.userId);
  }

  @Get(':id')
  async getGroup(@Param('id') id: number) {
    return this.groupsService.getGroup(id);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: number, @Body('userId') userId: number) {
    return this.groupsService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: number, @Param('userId') userId: number) {
    return this.groupsService.removeMember(id, userId);
  }

  @Delete(':id')
  async deleteGroup(@Request() req, @Param('id') id: number) {
    await this.groupsService.deleteGroup(id, req.user.userId);
    return { success: true };
  }
}

