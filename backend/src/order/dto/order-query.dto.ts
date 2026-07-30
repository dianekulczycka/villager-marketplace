import { SortQueryDto } from '../../shared/pagination/sort-query.dto';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsOptional()
  @IsEnum(OrderSortFieldEnum)
  declare sortBy?: OrderSortFieldEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  buyerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sellerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemId?: number;
}
