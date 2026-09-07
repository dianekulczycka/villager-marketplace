import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { order_status, Prisma, user_role } from '@prisma/client';
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
  ADMIN_USER_SELECT,
  buildUserPublicSearchWhere,
  USER_ADMIN_SELECT,
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
import {
  BUYER_ICON,
  MANAGER_ICON,
  USER_ICON_MAP,
} from '../shared/helpers/icon-map.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserAdminListEnum, whereMap } from './enums/user-admin-list.enum';
import { validateExists } from '../shared/helpers/validate-exists';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ----------------------------------------------------------------------------------------------------------
  // ---------------------------------------------- USER ------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findAllPublic(
    query: UserQueryDto,
    request: UserRequest,
  ): Promise<PaginationResponse<UserPublicDto>> {
    const orderField =
      USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.CREATED_AT];
    const role = request.user.role;

    const where: Prisma.userWhereInput =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? {
            ...ADMIN_ALL_USERS_WHERE,
            ...buildUserPublicSearchWhere(query.search),
          }
        : {
            ...ADMIN_ALL_USERS_WHERE,
            ...USER_PUBLIC_WHERE_BASE,
            ...buildUserPublicSearchWhere(query.search),
          };

    const select =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? USER_ADMIN_SELECT
        : USER_PUBLIC_SELECT;

    return paginatePrisma<UserPublicDto>(
      this.prisma.user,
      {
        where,
        select,
        orderBy: {
          [orderField]: query.sortDirection ?? SortDirectionEnum.ASC,
        },
      },
      query.page,
      query.perPage,
    );
  }

  async findById(publicId: string): Promise<UserPublicDto> {
    return validateExists(
      await this.prisma.user.findFirst({
        where: {
          ...USER_PUBLIC_WHERE_BASE,
          publicId,
        },
        select: USER_PUBLIC_SELECT,
      }),
      USER_ERRORS.NOT_FOUND,
    );
  }

  async findSelf(request: UserRequest): Promise<UserSelfDto> {
    return validateExists(
      await this.prisma.user.findUnique({
        where: {
          isDeleted: 0,
          id: request.user.userId,
        },
        select: USER_SELF_SELECT,
      }),
      USER_ERRORS.NOT_FOUND,
    );
  }

  // -------------------------------------------- PATCH -----------------------------------------------------

  async update(
    request: UserRequest,
    updateUserDto: UpdateUserDto,
    targetUserPublicId?: string,
  ): Promise<UserSelfDto> {
    const target = await this.findTargetUser(request, targetUserPublicId);
    this.canModifyUser(request, target.id, target.role);

    return this.prisma.user.update({
      where: { id: target.id },
      data: updateUserDto,
      select: USER_SELF_SELECT,
    });
  }

  async uploadAvatar(
    request: UserRequest,
    file: Express.Multer.File,
  ): Promise<UserSelfDto> {
    const newAvatarUrl: string = await this.cloudinaryService.upload(file);

    return this.prisma.user.update({
      where: { id: request.user.userId },
      data: {
        iconUrl: newAvatarUrl,
      },
      select: USER_SELF_SELECT,
    });
  }

  async softDelete(
    request: UserRequest,
    targetUserPublicId?: string,
  ): Promise<number> {
    const target = await this.findTargetUser(request, targetUserPublicId);
    this.canModifyUser(request, target.id, target.role);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: target.id },
        data: USER_SOFT_DELETE_DATA(request.user.email),
      }),
      this.prisma.token.updateMany({
        where: { userId: target.id },
        data: TOKEN_BLOCK_DATA,
      }),
      this.prisma.item.updateMany({
        where: { sellerId: target.id },
        data: ITEM_SOFT_DELETE_DATA,
      }),
    ]);

    return target.id;
  }

  async makeUserSeller(
    request: UserRequest,
    becomeSellerRequestDto: BecomeSellerRequestDto,
  ): Promise<number> {
    const user = await this.findUserByRequest(request);

    await this.prisma.$transaction([
      ...(user.role === user_role.SELLER
        ? [
            this.prisma.item.updateMany({
              where: { sellerId: user.id },
              data: ITEM_SOFT_DELETE_DATA,
            }),
          ]
        : []),

      this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: user_role.SELLER,
          sellerType: becomeSellerRequestDto.sellerType,
          iconUrl: USER_ICON_MAP[becomeSellerRequestDto.sellerType],
        },
      }),
    ]);

    return user.id;
  }

  // --------------------------------------------------------------------------------------------------------
  // -------------------------------------------- ADMIN -----------------------------------------------------
  // --------------------------------------------------------------------------------------------------------

  // -------------------------------------------- GET -----------------------------------------------------

  async findUsersAdmin(
    query: UserQueryDto,
    mode: UserAdminListEnum,
  ): Promise<PaginationResponse<UserAdminDto>> {
    const orderField =
      USER_SORT_MAP[query.sortBy ?? UserSortFieldEnum.CREATED_AT];

    return paginatePrisma<UserAdminDto>(
      this.prisma.user,
      {
        where: whereMap[mode],
        select: ADMIN_USER_SELECT,
        orderBy: {
          [orderField]: query.sortDirection ?? SortDirectionEnum.ASC,
        },
      },
      query.page,
      query.perPage,
    );
  }

  // -------------------------------------------- PATCH -----------------------------------------------------

  async banUser(publicId: string, request: UserRequest): Promise<string> {
    const user = await this.findUserByPublicId(publicId);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { publicId },
        data: USER_BAN_DATA(request.user.email),
      }),

      this.prisma.token.updateMany({
        where: { userId: user.id },
        data: TOKEN_BLOCK_DATA,
      }),

      this.prisma.item.updateMany({
        where: { sellerId: user.id },
        data: ITEM_SOFT_DELETE_DATA,
      }),

      this.prisma.order.updateMany({
        where: {
          sellerId: user.id,
          status: order_status.PENDING,
        },
        data: {
          status: order_status.REJECTED,
        },
      }),
    ]);

    return user.email;
  }

  async unbanUser(publicId: string): Promise<string> {
    const user = await this.findUserByPublicId(publicId);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: USER_UNBAN_DATA,
      }),

      this.prisma.item.updateMany({
        where: { sellerId: user.id },
        data: {
          isDeleted: 0,
        },
      }),
    ]);

    return user.email;
  }

  async unflagUser(publicId: string): Promise<string> {
    const user = await this.findUserByPublicId(publicId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isFlagged: 0,
      },
    });
    return user.email;
  }

  async promoteManager(publicId: string): Promise<void> {
    const user = await this.findUserByPublicId(publicId, {
      id: true,
      email: true,
      role: true,
    });

    if (!(user.role === user_role.BUYER || user.role === user_role.SELLER))
      throw new BadRequestException(USER_ERRORS.NOT_ALLOWED_UPDATE);

    await this.prisma.$transaction([
      this.prisma.item.updateMany({
        where: { sellerId: user.id },
        data: ITEM_SOFT_DELETE_DATA,
      }),

      this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: user_role.MANAGER,
          sellerType: null,
          iconUrl: MANAGER_ICON,
        },
      }),
    ]);
  }

  async demoteManager(publicId: string): Promise<void> {
    const user = await this.findUserByPublicId(publicId, {
      id: true,
      email: true,
      role: true,
    });

    if (user.role !== user_role.MANAGER)
      throw new BadRequestException(USER_ERRORS.NOT_ALLOWED_UPDATE);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: user_role.BUYER,
        sellerType: null,
        iconUrl: BUYER_ICON,
      },
    });
  }

  async restoreUser(publicId: string): Promise<string> {
    const user = validateExists(
      await this.prisma.user.findFirst({
        where: { publicId },
        select: {
          id: true,
          email: true,
          isDeleted: true,
        },
      }),
      USER_ERRORS.NOT_FOUND,
    );

    if (!user.isDeleted) throw new BadRequestException(USER_ERRORS.NOT_DELETED);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: 0,
        deletedAt: null,
        deletedBy: null,
      },
    });

    return user.email;
  }

  // -------------------------------------------- DELETE -----------------------------------------------------

  async hardDeleteUser(publicId: string): Promise<void> {
    const user = await this.findUserByPublicId(publicId);

    await this.prisma.$transaction([
      this.prisma.order.deleteMany({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
        },
      }),
      this.prisma.item.deleteMany({
        where: { sellerId: user.id },
      }),
      this.prisma.token.deleteMany({
        where: { userId: user.id },
      }),
      this.prisma.user.delete({
        where: { id: user.id },
      }),
    ]);
  }

  // -------------------------------------------- HELPERS -----------------------------------------------------

  private async findUserByPublicId(
    publicId: string,
    select?: Prisma.userSelect,
  ): Promise<UserAdminDto> {
    return validateExists(
      await this.prisma.user.findFirst({
        where: { publicId, isDeleted: 0 },
        select: select ?? { id: true, email: true },
      }),
      USER_ERRORS.NOT_FOUND,
    );
  }

  private async findUserByRequest(
    request: UserRequest,
    select?: Prisma.userSelect,
  ): Promise<UserAdminDto> {
    return validateExists(
      await this.prisma.user.findFirst({
        where: { id: request.user.userId, isDeleted: 0 },
        select: select ?? { id: true, email: true },
      }),
      USER_ERRORS.NOT_FOUND,
    );
  }

  private canModifyUser(
    request: UserRequest,
    targetId: number,
    targetRole: user_role,
  ): void {
    const actorId = request.user.userId;
    const actorRole = request.user.role;
    const isSelf = actorId === targetId;

    if (actorRole === user_role.BUYER || actorRole === user_role.SELLER) {
      if (!isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      return;
    }

    if (actorRole === user_role.MANAGER) {
      if (
        !isSelf &&
        (targetRole === user_role.ADMIN || targetRole === user_role.MANAGER)
      ) {
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      }
      return;
    }

    if (actorRole === user_role.ADMIN) {
      if (isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      return;
    }
  }

  private async findTargetUser(
    request: UserRequest,
    targetUserPublicId?: string,
  ): Promise<{ id: number; role: user_role }> {
    const select: Prisma.userSelect = { id: true, role: true };
    if (!targetUserPublicId)
      return await this.findUserByRequest(request, select);
    return await this.findUserByPublicId(targetUserPublicId, select);
  }
}
