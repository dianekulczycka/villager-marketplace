import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  USER_SORT_MAP,
  UserQueryDto,
  UserSortFieldEnum,
} from '../user/dto/user-query.dto';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { PrismaService } from '../prisma/prisma.service';
import {
  ADMIN_ALL_USERS_WHERE,
  ADMIN_BANNED_USERS_WHERE,
  ADMIN_FLAGGED_USERS_WHERE,
  ADMIN_MANAGERS_WHERE,
  ADMIN_USER_SELECT,
  USER_BAN_DATA,
  USER_UNBAN_DATA,
} from '../user/const/orm/user';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';
import { user_role } from '@prisma/client';
import { BUYER_ICON, MANAGER_ICON } from '../../public/icons/icon-map';
import { USER_ERRORS } from '../user/const/errors';
import { ITEM_SOFT_DELETE_DATA } from '../items/const/orm/item';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers(query: UserQueryDto) {
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

  async findFlaggedUsers(query: UserQueryDto) {
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

  async findBannedUsers(query: UserQueryDto) {
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

  async banUser(userId: number, request: IUserRequest): Promise<void> {
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

  async hardDeleteUser(userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.item.deleteMany({
        where: { sellerId: userId },
      }),
      this.prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  }

  async promoteManager(userId: number): Promise<void> {
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
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: user_role.BUYER,
        sellerType: null,
        iconUrl: BUYER_ICON,
      },
    });
  }
}
