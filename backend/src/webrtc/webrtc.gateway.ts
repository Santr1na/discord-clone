import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class WebRtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    client.to(roomId).emit('user-joined', client.id);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    client.to(roomId).emit('user-left', client.id);
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { roomId: string; offer: any }) {
    client.to(payload.roomId).emit('offer', {
      offer: payload.offer,
      from: client.id,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { roomId: string; answer: any }) {
    client.to(payload.roomId).emit('answer', {
      answer: payload.answer,
      from: client.id,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: { roomId: string; candidate: any }) {
    client.to(payload.roomId).emit('ice-candidate', {
      candidate: payload.candidate,
      from: client.id,
    });
  }
}

