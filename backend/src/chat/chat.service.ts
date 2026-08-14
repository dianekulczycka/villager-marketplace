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
import { UserPublicDto } from '../user/dto/user-public.dto';
import {
  buildUserPublicSearchWhere,
  USER_PUBLIC_SELECT,
  USER_PUBLIC_WHERE_BASE,
} from '../prisma/helpers/user.helpers';
import {
  USER_SORT_MAP,
  UserQueryDto,
  UserSortFieldEnum,
} from '../user/dto/user-query.dto';
import { Prisma } from '@prisma/client';

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
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserPublicDto>> {
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
      USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.CREATED_AT];

    const where: Prisma.userWhereInput = {
      ...USER_PUBLIC_WHERE_BASE,
      id: { in: userIds },
      ...buildUserPublicSearchWhere(query.search),
    };

    return paginatePrisma<UserPublicDto>(
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

  async markAsRead(uuid: string, request: UserRequest): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { uuid },
      select: {
        recipientId: true,
        isRead: true,
      },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (request.user.userId !== message.recipientId) return;
    if (message.isRead) return;

    await this.prisma.message.update({
      where: { uuid },
      data: {
        isRead: true,
      },
    });
  }
}
