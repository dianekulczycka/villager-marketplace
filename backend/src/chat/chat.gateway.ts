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
@WebSocketGateway(3004)
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    const createMessageDto = JSON.parse(body) as CreateMessageDto;
    const user = client.data as JwtPayload;
    return this.chatService.saveMessage(user, createMessageDto);
  }
}
