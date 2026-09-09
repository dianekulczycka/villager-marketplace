import { SortQueryDto } from '../../shared/pagination/sort-query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderSortFieldEnum {
  AMOUNT = 'amount',
  STATUS = 'status',
  CREATED_AT = 'created_at',
  BUYER_ID = 'buyer_id',
  SELLER_ID = 'seller_id',
  ITEM_ID = 'item_id',
}

export const ORDER_SORT_MAP: Record<OrderSortFieldEnum, string> = {
  [OrderSortFieldEnum.AMOUNT]: 'amount',
  [OrderSortFieldEnum.STATUS]: 'status',
  [OrderSortFieldEnum.CREATED_AT]: 'createdAt',
  [OrderSortFieldEnum.BUYER_ID]: 'buyerId',
  [OrderSortFieldEnum.SELLER_ID]: 'sellerId',
  [OrderSortFieldEnum.ITEM_ID]: 'itemId',
};

export class OrderQueryDto extends SortQueryDto<OrderSortFieldEnum> {
  @ApiPropertyOptional({
    enum: OrderSortFieldEnum,
    example: OrderSortFieldEnum.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OrderSortFieldEnum)
  declare sortBy?: OrderSortFieldEnum;

  @ApiPropertyOptional({ example: 'a1b2c3d4' })
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ example: 'c3d4e5f6' })
  @IsOptional()
  @IsString()
  itemId?: string;
}