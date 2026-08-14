import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../security/token/token.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatGateway, ChatService, JwtService, TokenService],
  controllers: [ChatController],
  imports: [AuthModule],
})
export class ChatModule {}
