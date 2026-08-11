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
import { UserPublicDto } from '../user/dto/user-public.dto';
import { PaginationRequestDto } from '../shared/pagination/pagination-request.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  async getAll(
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<UserPublicDto[]> {
    return this.chatService.findAll(request);
  }

  @Get('id/:userPublicId')
  async getByChatId(
    @Param('userPublicId') userPublicId: string,
    @Query() query: PaginationRequestDto,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<PaginationResponse<MessageResponseDto>> {
    return this.chatService.findByChatId(userPublicId, request, query);
  }
}
