import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { OrderRequestDto } from './dto/order-request.dto';
import { ITEM_ERRORS } from '../shared/errors/item.errors';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { OrderResponseDto } from './dto/order-response.dto';
import {
  ORDER_SORT_MAP,
  OrderQueryDto,
  OrderSortFieldEnum,
} from './dto/order-query.dto';
import { paginatePrisma } from '../shared/pagination/prisma-paginator';
import { SortDirectionEnum } from '../shared/pagination/pagination-request.dto';
import { OrderModeEnum } from './enums/order-mode.enum';
import { OrderEmailData } from '../mail/models/order-email-data';
import { ORDER_ERRORS } from '../shared/errors/order.errors';
import { order_status } from '@prisma/client';
import { generatePublicId } from '../shared/generators/private-id.generator';
import { ORDER_PUBLIC_SELECT } from '../prisma/helpers/order.helpers';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    request: UserRequest,
    itemPublicId: string,
    orderRequestDto?: OrderRequestDto,
  ): Promise<void> {
    const amount = orderRequestDto?.amount || 1;
    if (amount <= 0) throw new BadRequestException(ITEM_ERRORS.INVALID_AMOUNT);

    const { userId: buyerId } = request.user;
    const item = await this.prisma.item.findFirst({
      where: {
        publicId: itemPublicId,
        isDeleted: 0,
        seller: {
          isBanned: 0,
        },
      },
      select: {
        id: true,
        count: true,
        sellerId: true,
      },
    });

    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);
    if (item.sellerId === buyerId)
      throw new ForbiddenException(ORDER_ERRORS.NOT_ALLOWED);

    if (item.count < amount)
      throw new BadRequestException(ITEM_ERRORS.INVALID_AMOUNT);

    await this.prisma.order.create({
      data: {
        buyerId,
        sellerId: item.sellerId,
        itemId: item.id,
        amount,
        publicId: generatePublicId(),
      },
    });
  }

  async findMyOrders(
    query: OrderQueryDto,
    request: UserRequest,
    mode: OrderModeEnum,
  ): Promise<PaginationResponse<OrderResponseDto>> {
    const orderField =
      ORDER_SORT_MAP[query.sortBy ?? OrderSortFieldEnum.CREATED_AT];
    return paginatePrisma<OrderResponseDto>(
      this.prisma.order,
      {
        where:
          mode === OrderModeEnum.BUY
            ? { buyerId: request.user.userId }
            : { sellerId: request.user.userId },
        select: ORDER_PUBLIC_SELECT,
        orderBy: {
          [orderField]: query.sortDirection ?? SortDirectionEnum.ASC,
        },
      },
      query.page,
      query.perPage,
    );
  }

  async confirmOrder(
    request: UserRequest,
    publicId: string,
  ): Promise<OrderEmailData> {
    const order = await this.prisma.order.findFirst({
      where: { publicId },
      include: {
        buyer: {
          select: {
            email: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException(ORDER_ERRORS.NOT_FOUND);

    const { userId: sellerId } = request.user;

    if (order.sellerId !== sellerId)
      throw new ForbiddenException(ORDER_ERRORS.NOT_ALLOWED);

    if (order.status !== 'PENDING')
      throw new ForbiddenException(ORDER_ERRORS.NOT_ALLOWED);

    const item = await this.prisma.item.findFirst({
      where: {
        id: order.itemId,
      },
    });

    if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);

    if (item.count < order.amount)
      throw new BadRequestException(ITEM_ERRORS.INVALID_AMOUNT);

    const newCount = item.count - order.amount;

    await this.prisma.$transaction([
      this.prisma.item.update({
        where: { id: item.id },
        data: { count: newCount },
      }),
      this.prisma.order.update({
        where: { publicId },
        data: { status: order_status.CONFIRMED },
      }),
    ]);

    return {
      buyerEmail: order.buyer.email,
      sellerEmail: request.user.email,
      itemName: order.item.name,
    };
  }

  async rejectOrder(request: UserRequest, publicId: string): Promise<void> {
    const order = await this.prisma.order.findFirst({
      where: { publicId },
    });
    if (!order) throw new NotFoundException(ORDER_ERRORS.NOT_FOUND);

    const { userId: sellerId } = request.user;

    if (order.sellerId !== sellerId)
      throw new ForbiddenException(ORDER_ERRORS.NOT_ALLOWED);

    if (order.status !== 'PENDING')
      throw new ForbiddenException(ORDER_ERRORS.NOT_ALLOWED);

    await this.prisma.order.update({
      where: { publicId },
      data: { status: order_status.REJECTED },
    });
  }
}
