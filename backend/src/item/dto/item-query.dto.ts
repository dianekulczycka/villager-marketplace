import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SortQueryDto } from '../../shared/pagination/sort-query.dto';
import { Type } from 'class-transformer';

export enum ItemSortFieldEnum {
  ID = 'id',
  NAME = 'name',
  PRICE = 'price',
  COUNT = 'count',
  CREATED_AT = 'created_at',
  VIEWS = 'views',
  SELLER_ID = 'seller_id',
}

export const ITEM_SORT_MAP: Record<ItemSortFieldEnum, string> = {
  [ItemSortFieldEnum.ID]: 'id',
  [ItemSortFieldEnum.NAME]: 'name',
  [ItemSortFieldEnum.PRICE]: 'price',
  [ItemSortFieldEnum.COUNT]: 'count',
  [ItemSortFieldEnum.VIEWS]: 'views',
  [ItemSortFieldEnum.CREATED_AT]: 'createdAt',
  [ItemSortFieldEnum.SELLER_ID]: 'sellerId',
};

export class ItemQueryDto extends SortQueryDto<ItemSortFieldEnum> {
  @IsOptional()
  @IsEnum(ItemSortFieldEnum)
  declare sortBy?: ItemSortFieldEnum;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sellerId?: number;
}
