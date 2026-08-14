import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { Socket } from 'socket.io';

@UseGuards(WsJwtGuard)
@WebSocketGateway(3004, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data as JwtPayload;
    const message = await this.chatService.saveMessage(user, createMessageDto);
    client.emit('newMessage', message);
    return message;
  }
}
