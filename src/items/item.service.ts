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
import { ITEM_ICON_MAP } from '../../public/icons/icon-map';
import { Prisma, user_role } from '@prisma/client';
import {
  buildItemSearchWhere,
  ITEM_ADMIN_SELECT,
  ITEM_PUBLIC_SELECT,
  ITEM_PUBLIC_WHERE_BASE,
  ITEM_SOFT_DELETE_DATA,
} from '../prisma/helpers/item.helpers';
import { ITEM_ERRORS } from '../shared/errors/item.errors';
import { allowedItemsPerSeller } from './enums/allowed-items-per-seller.record';
import { USER_ERRORS } from '../shared/errors/user.errors';
import { canModifyItem } from '../shared/helpers/permission.helpers';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(
    query: ItemQueryDto,
    request: IUserRequest,
  ): Promise<IPaginatedResponse<ItemPublicDto>> {
    const orderField = ITEM_SORT_MAP[query.sortBy ?? ItemSortFieldEnum.ID];
    const role = request.user.role;

    const where: Prisma.itemWhereInput =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? {
            ...buildItemSearchWhere(query.search),
          }
        : {
            ...ITEM_PUBLIC_WHERE_BASE,
            ...buildItemSearchWhere(query.search),
          };

    const select =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? ITEM_ADMIN_SELECT
        : ITEM_PUBLIC_SELECT;

    return paginatePrisma<ItemPublicDto>(
      this.prisma.item,
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

  async findById(id: number, request: IUserRequest): Promise<ItemPublicDto> {
    const { userId, role } = request.user;

    const isAdmin = role === user_role.ADMIN || role === user_role.MANAGER;

    const where: Prisma.itemWhereInput = isAdmin
      ? { id }
      : { id, isDeleted: 0 };

    const select = isAdmin ? ITEM_ADMIN_SELECT : ITEM_PUBLIC_SELECT;

    const item = await this.prisma.item.findFirst({
      where,
      select,
    });

    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);

    const isOwner = item.seller.id === userId;
    if (!isOwner && !isAdmin) {
      await this.prisma.item.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }
    return item;
  }

  async findMyItems(request: IUserRequest): Promise<ItemPublicDto[]> {
    const userId = request.user.userId;

    return this.prisma.item.findMany({
      where: {
        sellerId: userId,
        isDeleted: 0,
      },
      select: ITEM_PUBLIC_SELECT,
    });
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

    if (!user?.sellerType) throw new ForbiddenException(USER_ERRORS.NOT_SELLER);

    const allowedItems = allowedItemsPerSeller[user.sellerType];

    if (!allowedItems.includes(createItemDto.name))
      throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);

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
    await canModifyItem(this.prisma, request, id);
    if (updateItemDto.name) {
      const user = await this.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { sellerType: true },
      });
      if (!user || !user.sellerType) {
        throw new ForbiddenException(USER_ERRORS.NOT_SELLER);
      }
      const allowedItems = allowedItemsPerSeller[user.sellerType];
      if (!allowedItems.includes(updateItemDto.name)) {
        throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);
      }
    }
    return this.prisma.item.update({
      where: { id },
      data: updateItemDto,
      select: ITEM_PUBLIC_SELECT,
    });
  }

  async softDelete(request: IUserRequest, id: number): Promise<void> {
    await canModifyItem(this.prisma, request, id);
    await this.prisma.item.update({
      where: { id },
      data: ITEM_SOFT_DELETE_DATA,
    });
  }
}
