import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { item_name, Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
import { plainToInstance } from 'class-transformer';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import {
  ITEM_SORT_MAP,
  ItemQueryDto,
  ItemSortFieldEnum,
} from './dto/item-query.dto';
import { paginate } from '../shared/pagination/paginate';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(
    query: ItemQueryDto,
  ): Promise<IPaginatedResponse<ItemPublicDto>> {
    const {
      page = 1,
      perPage = 10,
      sortBy = ItemSortFieldEnum.ID,
      sortDirection = SortDirectionEnum.ASC,
      search,
    } = query;

    const skip = (page - 1) * perPage;

    const where: Prisma.itemWhereInput = {
      isDeleted: 0,
    };

    if (search) {
      const or: Prisma.itemWhereInput[] = [
        {
          description: {
            contains: search,
          },
        },
      ];

      if (Object.values(item_name).includes(search as item_name)) {
        or.push({
          name: search as item_name,
        });
      }

      where.OR = or;
    }

    const orderField = sortBy
      ? ITEM_SORT_MAP[sortBy]
      : ITEM_SORT_MAP[ItemSortFieldEnum.ID];

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        include: {
          seller: true,
        },
        orderBy: {
          [orderField]: sortDirection,
        },
        skip,
        take: perPage,
      }),

      this.prisma.item.count({ where }),
    ]);

    const itemDtos = plainToInstance(ItemPublicDto, items, {
      excludeExtraneousValues: true,
    });

    return paginate(itemDtos, total, page, perPage);
  }

  async findById(id: number): Promise<ItemPublicDto> {
    const item = await this.prisma.item.findUnique({
      where: {
        id,
      },
      include: {
        seller: true,
      },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} was not found`);
    }
    return plainToInstance(ItemPublicDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    request: IUserRequest,
    createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    const { userId } = request.user;
    const item = await this.prisma.item.create({
      data: {
        ...createItemDto,
        seller: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return plainToInstance(ItemPublicDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    request: IUserRequest,
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    await this.assertUserOwnsItem(request, id);

    const item = await this.prisma.item.update({
      where: { id },
      data: updateItemDto,
    });

    return plainToInstance(ItemPublicDto, item, {
      excludeExtraneousValues: true,
    });
  }

  // todo soft delete item user token

  // todo cron delete tokens every 30 mins from db

  async softDelete(request: IUserRequest, id: number): Promise<void> {
    await this.assertUserOwnsItem(request, id);

    await this.prisma.item.update({
      where: { id },
      data: {
        isDeleted: 1,
      },
    });
  }

  async softDeleteItemsOfUser(userId: number): Promise<void> {
    await this.prisma.item.updateMany({
      where: {
        sellerId: userId,
      },
      data: {
        isDeleted: 1,
      },
    });
  }

  async delete(request: IUserRequest, id: number): Promise<void> {
    await this.assertUserOwnsItem(request, id);

    await this.prisma.item.delete({
      where: { id },
    });
  }

  async assertUserOwnsItem(
    request: IUserRequest,
    itemId: number,
  ): Promise<void> {
    const userId = request.user.userId;

    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item was not found');
    }

    if (item.sellerId !== userId) {
      throw new UnauthorizedException('Not authorized to modify item');
    }
  }
}
