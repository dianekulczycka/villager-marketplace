import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, user_role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { IUserRequest } from './interfaces/user-request.interface';
import { UserSelfDto } from './dto/user-self.dto';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import {
  USER_SORT_MAP,
  UserQueryDto,
  UserSortFieldEnum,
} from './dto/user-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';

import { BecomeSellerRequestDto } from './dto/become-seller-request';
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
} from './const/orm/user';
import { USER_ERRORS } from './const/errors';
import { ITEM_SOFT_DELETE_DATA } from '../items/const/orm/item';
import {
  BUYER_ICON,
  MANAGER_ICON,
  USER_ICON_MAP,
} from '../../public/icons/icon-map';
import { hasSwearWordsInDto } from '../shared/filters/swear-words/swear-words.filter';
import { UserAdminDto } from './dto/user-admin.dto';
import { AccountRecoveryRequestDto } from './dto/account-recovery-request.dto';
import { ModerationService } from '../moderation/moderation.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderationService: ModerationService,
  ) {}

  // ----------------------------------------------------------------------------------------------------------
  // ---------------------------------------------- USER ------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findAllPublic(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserPublicDto>> {
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

  async findSelf(request: IUserRequest): Promise<UserSelfDto> {
    const { userId } = request.user;
    const user = await this.prisma.user.findFirst({
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
    request: IUserRequest,
    targetUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    const { userId, role } = request.user;

    if (hasSwearWordsInDto(updateUserDto)) {
      await this.moderationService.flagUser(request.user.userId);
      throw new ForbiddenException(USER_ERRORS.BAD_LANGUAGE);
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, isBanned: true },
    });

    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    const isSelf = userId === targetUserId;

    if (role === user_role.BUYER || role === user_role.SELLER) {
      if (!isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    }

    if (role === user_role.MANAGER) {
      if (
        !isSelf &&
        (target.role === user_role.ADMIN || target.role === user_role.MANAGER)
      ) {
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      }
    }

    if (role === user_role.ADMIN) {
      if (isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: updateUserDto,
      select: USER_SELF_SELECT,
    });
  }

  async softDelete(
    request: IUserRequest,
    targetUserId?: number,
  ): Promise<void> {
    const actorId = request.user.userId;
    const actorRole = request.user.role;

    const userIdToDelete = targetUserId ?? actorId;
    const isSelf = actorId === userIdToDelete;

    const target = await this.prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { role: true },
    });

    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    if (actorRole === user_role.BUYER || actorRole === user_role.SELLER) {
      if (!isSelf) {
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      }
    }

    if (actorRole === user_role.MANAGER) {
      if (
        target.role === user_role.ADMIN ||
        target.role === user_role.MANAGER
      ) {
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      }
    }

    if (actorRole === user_role.ADMIN) {
      if (isSelf) {
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      }
    }

    await this.prisma.user.update({
      where: { id: userIdToDelete },
      data: USER_SOFT_DELETE_DATA(request.user.email),
    });
  }

  async makeUserSeller(
    request: IUserRequest,
    becomeSellerRequestDto: BecomeSellerRequestDto,
  ): Promise<number> {
    const userId = request.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    if (user.role === user_role.ADMIN || user.role === user_role.MANAGER) {
      throw new BadRequestException(USER_ERRORS.CANNOT_BECOME_SELLER);
    }

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

  async requestRecovery(accountRecoveryRequestDto: AccountRecoveryRequestDto) {
    await this.moderationService.requestRecovery(accountRecoveryRequestDto);
  }

  // --------------------------------------------------------------------------------------------------------
  // -------------------------------------------- ADMIN -----------------------------------------------------
  // --------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findAllUsers(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
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
  ): Promise<IPaginatedResponse<UserAdminDto>> {
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
  ): Promise<IPaginatedResponse<UserAdminDto>> {
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
    if (!user.isDeleted)
      throw new BadRequestException(USER_ERRORS.USER_NOT_DELETED);

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
      this.prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  }
}
