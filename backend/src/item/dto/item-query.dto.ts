import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortQueryDto } from '../../shared/pagination/sort-query.dto';

export enum ItemSortFieldEnum {
  NAME = 'name',
  PRICE = 'price',
  COUNT = 'count',
  CREATED_AT = 'created_at',
  VIEWS = 'views',
}

export const ITEM_SORT_MAP: Record<ItemSortFieldEnum, string> = {
  [ItemSortFieldEnum.NAME]: 'name',
  [ItemSortFieldEnum.PRICE]: 'price',
  [ItemSortFieldEnum.COUNT]: 'count',
  [ItemSortFieldEnum.VIEWS]: 'views',
  [ItemSortFieldEnum.CREATED_AT]: 'createdAt',
};

export class ItemQueryDto extends SortQueryDto<ItemSortFieldEnum> {
  @IsOptional()
  @IsEnum(ItemSortFieldEnum)
  declare sortBy?: ItemSortFieldEnum;

  @IsOptional()
  @IsString()
  sellerId?: string;
}
