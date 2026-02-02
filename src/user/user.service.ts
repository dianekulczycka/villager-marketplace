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
  buildUserPublicSearchWhere,
  USER_PUBLIC_SELECT,
  USER_PUBLIC_WHERE_BASE,
  USER_SELF_SELECT,
  USER_SOFT_DELETE_DATA,
} from './const/orm/user';
import { USER_ERRORS } from './const/errors';
import { ITokenPair } from '../auth/interfaces/token-pair.interface';
import { AuthService } from '../auth/auth.service';
import { ITEM_SOFT_DELETE_DATA } from '../items/const/orm/item';
import { USER_ICON_MAP } from '../../public/icons/icon-map';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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

  async update(
    request: IUserRequest,
    targetUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    const { userId, role } = request.user;
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, isBanned: true },
    });
    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    const isSelf = userId === targetUserId;

    if (role === user_role.BUYER || role === user_role.SELLER) {
      if (!isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
      if (target.isBanned)
        throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
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
  ): Promise<ITokenPair> {
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

    return this.authService.issueTokenPairForUser(userId);
  }
}
