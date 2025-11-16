import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to messages: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from messages: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    const message = await this.messagesService.createMessage(payload);
    this.server.emit('message', message);
  }
}

