import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { MessageSentResponseDto } from './dto/message-sent-response.dto';
import { ChatPublicDto } from './dto/chat-public.dto';
import { ChatQueryDto } from './dto/chat-query.dto';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  async getAll(
    @Request() request: userRequestInterface.UserRequest,
    @Query() query: ChatQueryDto,
  ): Promise<PaginationResponse<ChatPublicDto>> {
    return this.chatService.findAll(request, query);
  }

  @Get('user-id/:userPublicId')
  async getChatByUserId(
    @Param('userPublicId') userPublicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<MessageSentResponseDto[]> {
    return this.chatService.findChatByUserId(userPublicId, request);
  }
}
