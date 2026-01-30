import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { item_name, Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
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
import { prismaPaginator } from '../shared/pagination/prisma-paginator';
import { ITEM_ERRORS } from './const/errors';
import {
  ITEM_OWNER_SELECT,
  ITEM_PUBLIC_INCLUDE,
  ITEM_PUBLIC_WHERE_BASE,
  ITEM_SOFT_DELETE_DATA,
} from './const/orm/item';
import { allowedItemsPerSeller } from './const/enums/allowed-items-per-seller.record';

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

    const where: Prisma.itemWhereInput = {
      ...ITEM_PUBLIC_WHERE_BASE,
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
        or.push({ name: search as item_name });
      }

      where.OR = or;
    }

    const orderField = ITEM_SORT_MAP[sortBy];

    const { data, total } = await prismaPaginator<ItemPublicDto>(
      this.prisma.item,
      {
        where,
        orderBy: { [orderField]: sortDirection },
        page,
        perPage,
        include: ITEM_PUBLIC_INCLUDE,
      },
    );

    return paginate(data, total, page, perPage);
  }

  async findById(id: number): Promise<ItemPublicDto> {
    const item = await this.prisma.item.findFirst({
      where: {
        ...ITEM_PUBLIC_WHERE_BASE,
        id,
      },
      include: ITEM_PUBLIC_INCLUDE,
    });

    if (!item) {
      throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);
    }

    return item;
  }

  async create(
    request: IUserRequest,
    createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    const { userId } = request.user;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sellerType: true },
    });

    if (!user?.sellerType) throw new ForbiddenException(ITEM_ERRORS.NOT_SELLER);

    const allowedItems = allowedItemsPerSeller[user.sellerType];

    if (!allowedItems.includes(createItemDto.name))
      throw new ForbiddenException(ITEM_ERRORS.ITEM_NOT_ALLOWED);

    return this.prisma.item.create({
      data: {
        ...createItemDto,
        seller: {
          connect: { id: userId },
        },
      },
      include: ITEM_PUBLIC_INCLUDE,
    });
  }

  async update(
    request: IUserRequest,
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    await this.assertUserOwnsItem(request, id);

    if (updateItemDto.name) {
      const { userId } = request.user;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { sellerType: true },
      });

      if (!user?.sellerType)
        throw new ForbiddenException(ITEM_ERRORS.NOT_SELLER);

      const allowedItems = allowedItemsPerSeller[user.sellerType];

      if (!allowedItems.includes(updateItemDto.name))
        throw new ForbiddenException(ITEM_ERRORS.ITEM_NOT_ALLOWED);
    }

    return this.prisma.item.update({
      where: { id },
      data: updateItemDto,
      include: ITEM_PUBLIC_INCLUDE,
    });
  }

  // todo cron delete tokens every 40 mins from db

  async softDelete(request: IUserRequest, id: number): Promise<void> {
    await this.assertUserOwnsItem(request, id);

    await this.prisma.$transaction([
      this.prisma.item.update({
        where: { id },
        data: ITEM_SOFT_DELETE_DATA,
      }),
    ]);
  }

  async softDeleteItemsOfUser(userId: number): Promise<void> {
    await this.prisma.item.updateMany({
      where: {
        sellerId: userId,
      },
      data: ITEM_SOFT_DELETE_DATA,
    });
  }

  async assertUserOwnsItem(
    request: IUserRequest,
    itemId: number,
  ): Promise<void> {
    const userId = request.user.userId;

    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: ITEM_OWNER_SELECT,
    });

    if (!item) {
      throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);
    }

    if (item.sellerId !== userId) {
      throw new UnauthorizedException(ITEM_ERRORS.NOT_OWNER);
    }
  }
}
