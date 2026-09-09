import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortQueryDto } from '../../shared/pagination/sort-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({
    enum: ItemSortFieldEnum,
    example: ItemSortFieldEnum.PRICE,
  })
  @IsOptional()
  @IsEnum(ItemSortFieldEnum)
  declare sortBy?: ItemSortFieldEnum;

  @ApiPropertyOptional({ example: 'a1b2c3d4' })
  @IsOptional()
  @IsString()
  sellerId?: string;
}
