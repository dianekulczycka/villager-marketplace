import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from '../mail/mail.service';
import { Throttle } from '@nestjs/throttler';
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';
import { Roles } from '../auth/guards/allowed-roles.decorator';
import { user_role } from '@prisma/client';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { OrderRequestDto } from './dto/order-request.dto';
import { OrderService } from './order.service';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderModeEnum } from './enums/order-mode.enum';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.BUYER)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(201)
  @Post('id/:itemPublicId/order')
  async order(
    @Param('itemPublicId') itemPublicId: string,
    @Request() request: userRequestInterface.UserRequest,
    @Body() orderRequestDto?: OrderRequestDto,
  ): Promise<void> {
    await this.orderService.create(request, itemPublicId, orderRequestDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.BUYER)
  @Get('my/buying')
  async getMyOrdersBuy(
    @Request() request: userRequestInterface.UserRequest,
    @Query() query: OrderQueryDto,
  ): Promise<PaginationResponse<OrderResponseDto>> {
    return this.orderService.findMyOrders(query, request, OrderModeEnum.BUY);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @Get('my/selling')
  async getMyOrdersSell(
    @Request() request: userRequestInterface.UserRequest,
    @Query() query: OrderQueryDto,
  ): Promise<PaginationResponse<OrderResponseDto>> {
    return this.orderService.findMyOrders(query, request, OrderModeEnum.SELL);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @HttpCode(204)
  @Patch('id/:publicId/confirm')
  async corfirmOrder(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    const { buyerEmail, sellerEmail, itemName, amount } =
      await this.orderService.confirmOrder(request, publicId);

    await this.mailService.notifySellerPurchase(
      buyerEmail,
      sellerEmail,
      itemName,
      amount,
    );
    await this.mailService.notifyBuyerPurchase(
      buyerEmail,
      sellerEmail,
      itemName,
      amount,
    );
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @HttpCode(204)
  @Patch('id/:publicId/reject')
  async rejectOrder(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    await this.orderService.rejectOrder(request, publicId);
  }
}
