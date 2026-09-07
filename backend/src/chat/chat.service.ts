import { BadRequestException, Injectable } from '@nestjs/common';
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
import { MessageSentResponseDto } from './dto/message-sent-response.dto';
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
import { validateExists } from '../shared/helpers/validate-exists';
import { MESSAGE_ERRORS } from '../shared/errors/message.errors';
import { ChatOpenedResponseDto } from './dto/chat-opened-response.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async saveMessage(
    user: JwtPayload,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageSentResponseDto> {
    if (!createMessageDto.body?.trim())
      throw new BadRequestException(MESSAGE_ERRORS.EMPTY_MESSAGE);

    const recipient = validateExists(
      await this.prisma.user.findUnique({
        where: { publicId: createMessageDto.recipientPublicId },
        select: { id: true },
      }),
      USER_ERRORS.NOT_FOUND,
    );

    this.canMessage(user.userId, recipient.id);

    return this.prisma.message.create({
      data: {
        body: createMessageDto.body,
        senderId: user.userId,
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

    const result = await paginatePrisma<ChatPublicDto & { id: number }>(
      this.prisma.user,
      {
        where,
        select: {
          ...USER_PUBLIC_SELECT,
          id: true,
        },
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
          unreadMessages: await this.getUnreadCountFromUser(user.id, userId),
        })),
      ),
    };
  }

  async findChatByUserId(
    otherUserPublicId: string,
    request: UserRequest,
  ): Promise<MessageSentResponseDto[]> {
    const otherUser = validateExists(
      await this.prisma.user.findUnique({
        where: { publicId: otherUserPublicId },
        select: { id: true },
      }),
      USER_ERRORS.NOT_FOUND,
    );

    return this.prisma.message.findMany({
      where: buildChatWhere(request.user.userId, otherUser.id),
      select: MESSAGE_PUBLIC_SELECT,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async markChatAsRead(
    otherUserPublicId: string,
    currentUserId: number,
  ): Promise<ChatOpenedResponseDto> {
    const otherUser = validateExists(
      await this.prisma.user.findUnique({
        where: { publicId: otherUserPublicId },
        select: { id: true, publicId: true },
      }),
      USER_ERRORS.NOT_FOUND,
    );

    this.canMessage(otherUser.id, currentUserId);

    const count = await this.getUnreadCountFromUser(
      otherUser.id,
      currentUserId,
    );

    await this.prisma.message.updateMany({
      where: {
        senderId: otherUser.id,
        recipientId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      otherUserPublicId: otherUser.publicId,
      count,
    };
  }

  private async getUnreadCountFromUser(
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

  private canMessage(senderId: number, recipientId: number): void {
    if (senderId === recipientId)
      throw new BadRequestException(MESSAGE_ERRORS.CANNOT_MESSAGE_SELF);
    return;
  }
}
