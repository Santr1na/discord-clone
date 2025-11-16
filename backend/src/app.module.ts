import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { MessagesModule } from './messages/messages.module';
import { GroupsModule } from './groups/groups.module';
import { WebRtcModule } from './webrtc/webrtc.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'discord-clone.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    FriendsModule,
    MessagesModule,
    GroupsModule,
    WebRtcModule,
  ],
})
export class AppModule {}

