import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, user_role, user_sellerType } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { plainToInstance } from 'class-transformer';
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

    const skip = (page - 1) * perPage;

    const where: Prisma.userWhereInput = {
      role: user_role.SELLER,
      isBanned: 0,
      isDeleted: 0,
    };

    if (search) {
      const searchNumber = Number(search);
      const searchDate = new Date(search);

      const or: Prisma.userWhereInput[] = [
        {
          username: {
            contains: search,
          },
        },
      ];

      if (Object.values(user_sellerType).includes(search as user_sellerType)) {
        or.push({ sellerType: search as user_sellerType });
      }

      if (Number.isInteger(searchNumber)) {
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

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: {
          [orderField]: sortDirection,
        },
        skip,
        take: perPage,
      }),

      this.prisma.user.count({ where }),
    ]);

    const userDtos = users.map((user) =>
      plainToInstance(UserPublicDto, user, {
        excludeExtraneousValues: true,
      }),
    );

    return paginate(userDtos, total, page, perPage);
  }

  async findById(id: number): Promise<UserPublicDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        role: user_role.SELLER,
        isBanned: 0,
        isDeleted: 0,
      },
    });
    if (!user) {
      throw new NotFoundException(`User was not found`);
    }
    return plainToInstance(UserPublicDto, user);
  }

  async findSelf(request: IUserRequest): Promise<UserSelfDto> {
    const { userId } = request.user;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        role: user_role.SELLER,
        isBanned: 0,
        isDeleted: 0,
      },
    });
    return plainToInstance(UserSelfDto, user);
  }

  async updateSelf(
    request: IUserRequest,
    updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    const { userId } = request.user;

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
    });

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: user_role.SELLER,
        isBanned: 0,
        isDeleted: 0,
      },
    });

    if (!user) {
      throw new NotFoundException(`User was not found`);
    }

    return plainToInstance(UserSelfDto, user);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isDeleted: 1,
      },
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  // banUser unbanUser changeUserRole makeUserASeller - todo
}
