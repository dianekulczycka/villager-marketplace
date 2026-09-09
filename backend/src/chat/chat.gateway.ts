import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { Server, Socket } from 'socket.io';
import { OpenChatDto } from './dto/chat-opened-request.dto';
import { ChatOpenedResponseDto } from './dto/chat-opened-response.dto';
import { Throttle } from '@nestjs/throttler';

@UseGuards(WsJwtGuard)
@WebSocketGateway(3004, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  private readonly connectedUsers = new Map<number, string>();

  handleConnection(client: Socket) {
    const user = client.data as JwtPayload;
    this.connectedUsers.set(user.userId, client.id);
    this.logger.log(
      `user id:${user.userId} connected with socket ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    const user = client.data as JwtPayload;
    this.connectedUsers.delete(user.userId);
    this.logger.log(`user id:${user.userId} disconnected`);
  }

  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() createMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = client.data as JwtPayload;
    const message = await this.chatService.saveMessage(user, createMessageDto);
    client.emit('newMessage', message);
    const recipientSocketId = this.connectedUsers.get(message.recipientId);
    if (recipientSocketId)
      this.server.to(recipientSocketId).emit('newMessage', message);
  }

  @SubscribeMessage('openChat')
  async handleOpenChat(
    @MessageBody() openChatDto: OpenChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = client.data as JwtPayload;
    const result: ChatOpenedResponseDto = await this.chatService.markChatAsRead(
      openChatDto.userPublicId,
      user.userId,
    );
    client.emit('chatOpened', {
      otherUserPublicId: openChatDto.userPublicId,
      unreadMessages: result.unreadMessages,
    });
  }
}
