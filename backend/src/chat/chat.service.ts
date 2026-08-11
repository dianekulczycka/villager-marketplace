import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { USER_ERRORS } from '../shared/errors/user.errors';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildChatWhere,
  buildUserMessagesWhere,
  MESSAGE_PARTICIPANTS_SELECT,
  MESSAGE_PUBLIC_SELECT,
} from '../prisma/helpers/message.helpers';
import { MessageResponseDto } from './dto/message-response.dto';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { PaginationRequestDto } from '../shared/pagination/pagination-request.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { USER_PUBLIC_SELECT } from '../prisma/helpers/user.helpers';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async saveMessage(
    user: JwtPayload,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const senderId = user.userId;
    const recipient = await this.prisma.user.findUnique({
      where: { publicId: createMessageDto.recipientPublicId },
      select: { id: true },
    });
    if (!recipient) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    if (senderId === recipient.id)
      throw new BadRequestException('You cannot message yourself');

    return this.prisma.message.create({
      data: {
        body: createMessageDto.body,
        senderId,
        recipientId: recipient.id,
      },
      select: MESSAGE_PUBLIC_SELECT,
    });
  }

  async findAll(request: UserRequest): Promise<UserPublicDto[]> {
    const userId = request.user.userId;

    const messages = await this.prisma.message.findMany({
      where: buildUserMessagesWhere(userId),
      select: MESSAGE_PARTICIPANTS_SELECT,
    });

    const userIds = [
      ...new Set(
        messages.map((message) =>
          message.senderId === userId ? message.recipientId : message.senderId,
        ),
      ),
    ];

    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: USER_PUBLIC_SELECT,
    });
  }

  async findByChatId(
    userPublicId: string,
    request: UserRequest,
    query: PaginationRequestDto,
  ): Promise<PaginationResponse<MessageResponseDto>> {
    const otherUser = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      select: { id: true },
    });

    if (!otherUser) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    return paginatePrisma<MessageResponseDto>(
      this.prisma.message,
      {
        where: buildChatWhere(request.user.userId, otherUser.id),
        select: MESSAGE_PUBLIC_SELECT,
        orderBy: {
          createdAt: 'desc',
        },
      },
      query.page,
      query.perPage,
    );
  }
}
