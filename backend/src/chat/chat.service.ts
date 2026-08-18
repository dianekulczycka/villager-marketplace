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
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import {
  buildUserPublicSearchWhere,
  USER_PUBLIC_SELECT,
  USER_PUBLIC_WHERE_BASE,
} from '../prisma/helpers/user.helpers';
import { Prisma } from '@prisma/client';
import { ChatPublicDto } from './dto/chat-public.dto';
import {
  CHAT_SORT_MAP,
  ChatQueryDto,
  ChatSortFieldEnum,
} from './dto/chat-query.dto';

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

  async findAll(
    request: UserRequest,
    query: ChatQueryDto,
  ): Promise<PaginationResponse<ChatPublicDto>> {
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

    const orderField =
      CHAT_SORT_MAP[query.sortBy ?? ChatSortFieldEnum.USERNAME];

    const where: Prisma.userWhereInput = {
      ...USER_PUBLIC_WHERE_BASE,
      id: { in: userIds },
      ...buildUserPublicSearchWhere(query.search),
    };

    const result = await paginatePrisma<ChatPublicDto>(
      this.prisma.user,
      {
        where,
        select: USER_PUBLIC_SELECT,
        orderBy: {
          [orderField]: query.sortDirection ?? SortDirectionEnum.ASC,
        },
      },
      query.page,
      query.perPage,
    );

    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (user) => ({
          ...user,
          unreadMessages: await this.countUnreadMessages(
            user.publicId,
            request,
          ),
        })),
      ),
    };
  }

  async findChatByUserId(
    userPublicId: string,
    request: UserRequest,
  ): Promise<MessageResponseDto[]> {
    const otherUser = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      select: { id: true },
    });

    if (!otherUser) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    return this.prisma.message.findMany({
      where: buildChatWhere(request.user.userId, otherUser.id),
      select: MESSAGE_PUBLIC_SELECT,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async countUnreadMessages(
    senderId: number,
    recipientId: number,
  ): Promise<number> {
    return this.prisma.message.count({
      where: {
        senderId,
        recipientId,
        isRead: false,
      },
    });
  }

  async markChatAsRead(senderId: number, recipientId: number): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        senderId,
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
