import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, user_role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { UserRequest } from './interfaces/user-request.interface';
import { UserSelfDto } from './dto/user-self.dto';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import {
  USER_SORT_MAP,
  UserQueryDto,
  UserSortFieldEnum,
} from './dto/user-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';

import { BecomeSellerRequestDto } from './dto/become-seller-request';
import { UserAdminDto } from './dto/user-admin.dto';
import {
  ADMIN_ALL_USERS_WHERE,
  ADMIN_BANNED_USERS_WHERE,
  ADMIN_FLAGGED_USERS_WHERE,
  ADMIN_MANAGERS_WHERE,
  ADMIN_USER_SELECT,
  buildUserPublicSearchWhere,
  USER_BAN_DATA,
  USER_PUBLIC_SELECT,
  USER_PUBLIC_WHERE_BASE,
  USER_SELF_SELECT,
  USER_SOFT_DELETE_DATA,
  USER_UNBAN_DATA,
} from '../prisma/helpers/user.helpers';
import { USER_ERRORS } from '../shared/errors/user.errors';
import { ITEM_SOFT_DELETE_DATA } from '../prisma/helpers/item.helpers';
import { TOKEN_BLOCK_DATA } from '../prisma/helpers/token.helpers';
import { canModifyUser } from '../shared/helpers/permission.helpers';
import {
  BUYER_ICON,
  MANAGER_ICON,
  USER_ICON_MAP,
} from '../shared/helpers/icon-map.helper';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------------------------------------------------------------
  // ---------------------------------------------- USER ------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findAllPublic(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserPublicDto>> {
    const orderField = USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.ID];
    const where: Prisma.userWhereInput = {
      ...USER_PUBLIC_WHERE_BASE,
      ...buildUserPublicSearchWhere(query.search),
    };
    return paginatePrisma<UserPublicDto>(
      this.prisma.user,
      {
        where,
        select: USER_PUBLIC_SELECT,
        orderBy: { [orderField]: query.sortDirection ?? SortDirectionEnum.ASC },
      },
      query.page,
      query.perPage,
    );
  }

  async findById(id: number): Promise<UserPublicDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        ...USER_PUBLIC_WHERE_BASE,
        id,
      },
      select: USER_PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    return user;
  }

  async findSelf(request: UserRequest): Promise<UserSelfDto> {
    const { userId } = request.user;
    const user = await this.prisma.user.findUnique({
      where: {
        isDeleted: 0,
        id: userId,
      },
      select: USER_SELF_SELECT,
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    return user;
  }

  // -------------------------------------------- PATCH -----------------------------------------------------

  async update(
    request: UserRequest,
    targetUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    targetUserId = targetUserId ?? request.user.userId;
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    canModifyUser(request, targetUserId, target.role);

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: updateUserDto,
      select: USER_SELF_SELECT,
    });
  }

  async softDelete(request: UserRequest, targetUserId?: number): Promise<void> {
    targetUserId = targetUserId ?? request.user.userId;
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    canModifyUser(request, targetUserId, target.role);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetUserId },
        data: USER_SOFT_DELETE_DATA(request.user.email),
      }),
      this.prisma.token.updateMany({
        where: { userId: targetUserId },
        data: TOKEN_BLOCK_DATA,
      }),
      this.prisma.item.updateMany({
        where: { sellerId: targetUserId },
        data: ITEM_SOFT_DELETE_DATA,
      }),
    ]);
  }

  async makeUserSeller(
    request: UserRequest,
    becomeSellerRequestDto: BecomeSellerRequestDto,
  ): Promise<number> {
    const userId = request.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    await this.prisma.$transaction([
      ...(user.role === user_role.SELLER
        ? [
            this.prisma.item.updateMany({
              where: { sellerId: userId },
              data: ITEM_SOFT_DELETE_DATA,
            }),
          ]
        : []),

      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: user_role.SELLER,
          sellerType: becomeSellerRequestDto.sellerType,
          iconUrl: USER_ICON_MAP[becomeSellerRequestDto.sellerType],
        },
      }),
    ]);

    return userId;
  }

  // --------------------------------------------------------------------------------------------------------
  // -------------------------------------------- ADMIN -----------------------------------------------------
  // --------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findAllUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    const orderField = USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.ID];

    return paginatePrisma<UserAdminDto>(
      this.prisma.user,
      {
        where: ADMIN_ALL_USERS_WHERE,
        select: ADMIN_USER_SELECT,
        orderBy: { [orderField]: query.sortDirection ?? SortDirectionEnum.ASC },
      },
      query.page,
      query.perPage,
    );
  }

  async findFlaggedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    const orderField = USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.ID];
    return paginatePrisma<UserAdminDto>(
      this.prisma.user,
      {
        where: ADMIN_FLAGGED_USERS_WHERE,
        select: ADMIN_USER_SELECT,
        orderBy: { [orderField]: query.sortDirection ?? SortDirectionEnum.ASC },
      },
      query.page,
      query.perPage,
    );
  }

  async findBannedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    const orderField = USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.ID];

    return paginatePrisma<UserAdminDto>(
      this.prisma.user,
      {
        where: ADMIN_BANNED_USERS_WHERE,
        select: ADMIN_USER_SELECT,
        orderBy: { [orderField]: query.sortDirection ?? SortDirectionEnum.ASC },
      },
      query.page,
      query.perPage,
    );
  }

  async findAllManagers(query: UserQueryDto) {
    const orderField = USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.ID];

    return paginatePrisma<UserAdminDto>(
      this.prisma.user,
      {
        where: ADMIN_MANAGERS_WHERE,
        select: ADMIN_USER_SELECT,
        orderBy: { [orderField]: query.sortDirection ?? SortDirectionEnum.ASC },
      },
      query.page,
      query.perPage,
    );
  }

  // -------------------------------------------- PATCH -----------------------------------------------------

  async banUser(userId: number, request: UserRequest): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: 0 },
      select: { id: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    await this.prisma.user.update({
      where: { id: userId },
      data: USER_BAN_DATA(request.user.email),
    });
  }

  async unbanUser(userId: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: 0 },
      select: { id: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    await this.prisma.user.update({
      where: { id: userId },
      data: USER_UNBAN_DATA,
    });
  }

  async unflagUser(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isFlagged: 0,
      },
    });
  }

  async promoteManager(userId: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    if (user.role !== user_role.BUYER)
      throw new BadRequestException(USER_ERRORS.NOT_ALLOWED_UPDATE);

    await this.prisma.$transaction([
      this.prisma.item.updateMany({
        where: { sellerId: userId },
        data: ITEM_SOFT_DELETE_DATA,
      }),

      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: user_role.MANAGER,
          sellerType: null,
          iconUrl: MANAGER_ICON,
        },
      }),
    ]);
  }

  async demoteManager(userId: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: 0 },
      select: { role: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    if (user.role !== user_role.MANAGER)
      throw new BadRequestException(USER_ERRORS.NOT_ALLOWED_UPDATE);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: user_role.BUYER,
        sellerType: null,
        iconUrl: BUYER_ICON,
      },
    });
  }

  async restoreUser(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isDeleted: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    if (!user.isDeleted) throw new BadRequestException(USER_ERRORS.NOT_DELETED);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: 0,
        deletedAt: null,
        deletedBy: null,
      },
    });
  }

  // -------------------------------------------- DELETE -----------------------------------------------------

  async hardDeleteUser(userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.item.deleteMany({
        where: { sellerId: userId },
      }),
      this.prisma.token.deleteMany({
        where: { userId },
      }),
      this.prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  }
}
