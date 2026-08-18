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
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { Server, Socket } from 'socket.io';
import { OpenChatDto } from './dto/chat-opened.dto';
import { MessageReadResponseDto } from './dto/message-read-response.dto';

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

  handleConnection(client: Socket) {
    try {
      const user = client.data as JwtPayload;
      this.logger.log(
        `user id:${user.userId} connected (client id:${client.id})`,
      );
    } catch (error: any) {
      this.logger.error(`connect error: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const user = client.data as JwtPayload;
      this.logger.log(
        `user id:${user.userId} disconnected (client id: ${client.id})`,
      );
    } catch (error: any) {
      this.logger.error(`disconnect error: ${error}`);
    }
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = client.data as JwtPayload;
    const message = await this.chatService.saveMessage(user, createMessageDto);
    client.emit('newMessage', message);
  }

  @SubscribeMessage('openChat')
  async handleOpenChat(
    @MessageBody() openChatDto: OpenChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = client.data as JwtPayload;
    const result: MessageReadResponseDto =
      await this.chatService.markChatAsRead(
        openChatDto.otherUserPublicId,
        user.userId,
      );
    client.emit('chatOpened', {
      otherUserPublicId: openChatDto.otherUserPublicId,
      markedAsReadCount: result.count,
    });
  }
}
