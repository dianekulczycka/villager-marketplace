import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, user_role, user_sellerType } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { IUserRequest } from './interfaces/user-request.interface';
import { UserSelfDto } from './dto/user-self.dto';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import { paginate } from '../shared/pagination/paginate';
import {
  USER_SORT_MAP,
  UserQueryDto,
  UserSortFieldEnum,
} from './dto/user-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { prismaPaginator } from '../shared/pagination/prisma-paginator';
import { UserAdminDto } from './dto/user-admin.dto';

import { BecomeSellerRequestDto } from './dto/become-seller-request';
import {
  USER_BAN_DATA,
  USER_FLAGGED_WHERE_BASE,
  USER_MANAGER_SELECT,
  USER_PUBLIC_WHERE_BASE,
  USER_SELF_WHERE_BASE,
  USER_UNBAN_DATA,
} from './const/orm/user';
import {
  USER_ADMIN_SELECT,
  USER_PUBLIC_SELECT,
  USER_SELF_SELECT,
} from './const/orm/user';
import { USER_ERRORS } from './const/errors';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserPublicDto>> {
    const {
      page = 1,
      perPage = 10,
      sortBy = UserSortFieldEnum.ID,
      sortDirection = SortDirectionEnum.ASC,
      search,
    } = query;

    const where: Prisma.userWhereInput = {
      ...USER_PUBLIC_WHERE_BASE,
    };

    if (search) {
      const searchNumber = Number(search);
      const searchDate = new Date(search);

      const or: Prisma.userWhereInput[] = [{ username: { contains: search } }];

      if (Object.values(user_sellerType).includes(search as user_sellerType)) {
        or.push({ sellerType: search as user_sellerType });
      }

      if (!isNaN(searchNumber)) {
        or.push({ id: searchNumber });
      }

      if (!isNaN(searchDate.getTime())) {
        or.push({
          createdAt: {
            gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            lt: new Date(searchDate.setHours(23, 59, 59, 999)),
          },
        });
      }

      where.OR = or;
    }

    const orderField = USER_SORT_MAP[sortBy];

    const { data, total } = await prismaPaginator<UserPublicDto>(
      this.prisma.user,
      {
        where,
        orderBy: { [orderField]: sortDirection },
        page,
        perPage,
        select: USER_PUBLIC_SELECT,
      },
    );

    return paginate(data, total, page, perPage);
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
        ...USER_SELF_WHERE_BASE,
        id: userId,
      },
      select: USER_SELF_SELECT,
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    return user;
  }

  async updateSelf(
    request: IUserRequest,
    updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    const { userId } = request.user;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: USER_SELF_SELECT,
    });
  }

  async makeUserSeller(
    request: IUserRequest,
    becomeSellerRequestDto: BecomeSellerRequestDto,
  ): Promise<void> {
    const userId = request.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }

    if (user.role === user_role.ADMIN || user.role === user_role.MANAGER) {
      throw new BadRequestException(USER_ERRORS.CANNOT_BECOME_SELLER);
    }

    await this.prisma.$transaction(async (tx) => {
      if (user.role === user_role.SELLER) {
        await tx.item.updateMany({
          where: { sellerId: userId },
          data: { isDeleted: 1 },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          role: user_role.SELLER,
          sellerType: becomeSellerRequestDto.sellerType,
        },
      });
    });
  }

  // ------------------------------------------- ADMIN ACTIONS ----------------------------------------------------------

  async findAllAdmin(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    const {
      page = 1,
      perPage = 10,
      sortBy = UserSortFieldEnum.ID,
      sortDirection = SortDirectionEnum.ASC,
    } = query;

    const orderField = USER_SORT_MAP[sortBy];

    const { data, total } = await prismaPaginator(this.prisma.user, {
      orderBy: { [orderField]: sortDirection },
      page,
      perPage,
      select: USER_ADMIN_SELECT,
    });

    return paginate(data as UserAdminDto[], total, page, perPage);
  }

  async findAllFlagged(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    const {
      page = 1,
      perPage = 10,
      sortBy = UserSortFieldEnum.ID,
      sortDirection = SortDirectionEnum.ASC,
    } = query;

    const where: Prisma.userWhereInput = {
      ...USER_FLAGGED_WHERE_BASE,
    };

    const orderField = USER_SORT_MAP[sortBy];

    const { data, total } = await prismaPaginator(this.prisma.user, {
      where,
      orderBy: { [orderField]: sortDirection },
      page,
      perPage,
      select: USER_ADMIN_SELECT,
    });

    return paginate(data as UserAdminDto[], total, page, perPage);
  }

  async findAllManagers(): Promise<UserAdminDto[]> {
    return this.prisma.user.findMany({
      where: {
        role: user_role.MANAGER,
        isDeleted: 0,
      },
      select: USER_MANAGER_SELECT,
    });
  }

  async banUser(id: number, bannedBy: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: USER_BAN_DATA(bannedBy),
    });
  }

  async unbanUser(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: USER_UNBAN_DATA,
    });
  }

  async changeUserRole(id: number, role: user_role): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async makeUserSellerByAdmin(
    id: number,
    sellerType: user_sellerType,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        role: user_role.SELLER,
        sellerType,
      },
    });
  }
}
