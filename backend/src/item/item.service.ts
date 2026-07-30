import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import {
  ITEM_SORT_MAP,
  ItemQueryDto,
  ItemSortFieldEnum,
} from './dto/item-query.dto';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';
import { order_status, Prisma, user_role } from '@prisma/client';
import {
  buildItemSearchWhere,
  ITEM_ADMIN_SELECT,
  ITEM_PUBLIC_DETAILED_SELECT,
  ITEM_PUBLIC_SELECT,
  ITEM_PUBLIC_WHERE_BASE,
  ITEM_SOFT_DELETE_DATA,
} from '../prisma/helpers/item.helpers';
import { ITEM_ERRORS } from '../shared/errors/item.errors';
import { allowedItemsPerSeller } from './enums/allowed-items-per-seller.record';
import { USER_ERRORS } from '../shared/errors/user.errors';
import { canModifyItem } from '../shared/helpers/permission.helpers';
import { ITEM_ICON_MAP } from '../shared/helpers/icon-map.helper';
import { ItemPublicDetailedDto } from './dto/item-public-detailed.dto';
import { generatePublicId } from '../shared/generators/private-id.generator';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(
    query: ItemQueryDto,
    request: UserRequest,
  ): Promise<PaginationResponse<ItemPublicDto>> {
    const orderField =
      ITEM_SORT_MAP[query.sortBy ?? ItemSortFieldEnum.CREATED_AT];
    const role = request.user.role;

    let sellerId: number | undefined;

    if (query.sellerId) {
      const seller = await this.prisma.user.findUnique({
        where: {
          publicId: query.sellerId,
        },
        select: {
          id: true,
        },
      });

      sellerId = seller?.id ?? -1;
    }

    const where: Prisma.itemWhereInput =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? {
            ...(sellerId !== undefined && { sellerId }),
            ...buildItemSearchWhere(query.search),
          }
        : {
            ...ITEM_PUBLIC_WHERE_BASE,
            ...(sellerId !== undefined && { sellerId }),
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

  async findById(
    publicId: string,
    request: UserRequest,
  ): Promise<ItemPublicDetailedDto> {
    const { item } = await this.getItemForUser(publicId, request);
    return item;
  }

  async incrementViews(publicId: string, request: UserRequest): Promise<void> {
    const { isAdmin, isOwner } = await this.getItemForUser(publicId, request);
    if (isAdmin || isOwner) return;
    await this.prisma.item.update({
      where: { publicId },
      data: { views: { increment: 1 } },
    });
  }

  private async getItemForUser(publicId: string, request: UserRequest) {
    const { userId, role } = request.user;

    const isAdmin = role === user_role.ADMIN || role === user_role.MANAGER;

    const where: Prisma.itemWhereInput = isAdmin
      ? { publicId }
      : { publicId, isDeleted: 0 };

    const select = isAdmin ? ITEM_ADMIN_SELECT : ITEM_PUBLIC_DETAILED_SELECT;

    const item = await this.prisma.item.findFirst({
      where,
      select,
    });

    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);

    return {
      item,
      isAdmin,
      isOwner: item.seller.id === userId,
    };
  }

  async findMyItems(
    query: ItemQueryDto,
    request: UserRequest,
  ): Promise<PaginationResponse<ItemPublicDto>> {
    const orderField =
      ITEM_SORT_MAP[query.sortBy ?? ItemSortFieldEnum.CREATED_AT];
    const role = request.user.role;

    const where: Prisma.itemWhereInput =
      role === user_role.ADMIN || role === user_role.MANAGER
        ? {
            sellerId: request.user.userId,
            ...buildItemSearchWhere(query.search),
          }
        : {
            ...ITEM_PUBLIC_WHERE_BASE,
            sellerId: request.user.userId,
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

  async create(
    request: UserRequest,
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
        publicId: generatePublicId(),
        iconUrl: ITEM_ICON_MAP[createItemDto.name],
        seller: { connect: { id: userId } },
      },
      select: ITEM_PUBLIC_SELECT,
    });
  }

  async update(
    request: UserRequest,
    publicId: string,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    await canModifyItem(this.prisma, request, publicId);
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
      where: { publicId },
      data: updateItemDto,
      select: ITEM_PUBLIC_SELECT,
    });
  }

  async softDelete(request: UserRequest, publicId: string): Promise<void> {
    const item = await canModifyItem(this.prisma, request, publicId);

    await this.prisma.$transaction([
      this.prisma.item.update({
        where: { publicId },
        data: ITEM_SOFT_DELETE_DATA,
      }),
      this.prisma.order.updateMany({
        where: {
          itemId: item.id,
          status: order_status.PENDING,
        },
        data: {
          status: order_status.REJECTED,
        },
      }),
    ]);
  }
}
