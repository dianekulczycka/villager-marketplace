import { IsEnum, IsOptional } from 'class-validator';
import { PaginationRequestDto } from '../../shared/pagination/pagination-request.dto';

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
  [ItemSortFieldEnum.SELLER_ID]: 'seller_id',
};

export class ItemQueryDto extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(ItemSortFieldEnum)
  sortBy?: ItemSortFieldEnum;
}
