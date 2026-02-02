import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';
import { ITEM_ERRORS } from './const/errors';
import {
  buildItemSearchWhere,
  ITEM_OWNER_SELECT,
  ITEM_PUBLIC_SELECT,
  ITEM_PUBLIC_WHERE_BASE,
  ITEM_SOFT_DELETE_DATA,
} from './const/orm/item';
import { allowedItemsPerSeller } from './const/enums/allowed-items-per-seller.record';
import { ITEM_ICON_MAP } from '../../public/icons/icon-map';
import { user_role } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(
    query: ItemQueryDto,
  ): Promise<IPaginatedResponse<ItemPublicDto>> {
    const orderField = ITEM_SORT_MAP[query.sortBy ?? ItemSortFieldEnum.ID];

    return paginatePrisma<ItemPublicDto>(
      this.prisma.item,
      {
        where: {
          ...ITEM_PUBLIC_WHERE_BASE,
          ...buildItemSearchWhere(query.search),
        },
        select: ITEM_PUBLIC_SELECT,
        orderBy: {
          [orderField]: query.sortDirection ?? SortDirectionEnum.ASC,
        },
      },
      query.page,
      query.perPage,
    );
  }

  async findById(id: number): Promise<ItemPublicDto> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        isDeleted: 0,
      },
      select: ITEM_PUBLIC_SELECT,
    });
    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);
    await this.prisma.item.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return item;
  }

  async create(
    request: IUserRequest,
    createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    const { userId } = request.user;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sellerType: true, isBanned: true },
    });

    if (user?.isBanned) throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);

    if (!user?.sellerType) throw new ForbiddenException(ITEM_ERRORS.NOT_SELLER);

    const allowedItems = allowedItemsPerSeller[user.sellerType];

    if (!allowedItems.includes(createItemDto.name))
      throw new ForbiddenException(ITEM_ERRORS.ITEM_NOT_ALLOWED);

    return this.prisma.item.create({
      data: {
        ...createItemDto,
        iconUrl: ITEM_ICON_MAP[createItemDto.name],
        seller: { connect: { id: userId } },
      },
      select: ITEM_PUBLIC_SELECT,
    });
  }

  async update(
    request: IUserRequest,
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    await this.assertPermission(request, id);

    if (updateItemDto.name) {
      const user = await this.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { sellerType: true },
      });

      const allowedItems = allowedItemsPerSeller[user!.sellerType!];
      if (!allowedItems.includes(updateItemDto.name))
        throw new ForbiddenException(ITEM_ERRORS.ITEM_NOT_ALLOWED);
    }

    return this.prisma.item.update({
      where: { id },
      data: updateItemDto,
      select: ITEM_PUBLIC_SELECT,
    });
  }

  // todo cron delete tokens every 40 mins from db

  async softDelete(request: IUserRequest, id: number): Promise<void> {
    await this.assertPermission(request, id);

    await this.prisma.item.update({
      where: { id },
      data: ITEM_SOFT_DELETE_DATA,
    });
  }

  async assertPermission(request: IUserRequest, itemId: number): Promise<void> {
    const { userId, role } = request.user;
    if (role === user_role.ADMIN || role === user_role.MANAGER) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true },
    });

    if (user?.isBanned) throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);

    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: ITEM_OWNER_SELECT,
    });

    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);

    if (item.sellerId !== userId)
      throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);
  }
}
