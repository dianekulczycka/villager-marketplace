import { IsEnum, IsOptional } from 'class-validator';
import { SortQueryDto } from '../../shared/pagination/sort-query.dto';

export enum UserSortFieldEnum {
  ID = 'id',
  USERNAME = 'username',
  SELLER_TYPE = 'seller_type',
  CREATED_AT = 'created_at',
}

export const USER_SORT_MAP: Record<UserSortFieldEnum, string> = {
  [UserSortFieldEnum.ID]: 'id',
  [UserSortFieldEnum.USERNAME]: 'username',
  [UserSortFieldEnum.SELLER_TYPE]: 'sellerType',
  [UserSortFieldEnum.CREATED_AT]: 'createdAt',
};

export class UserQueryDto extends SortQueryDto<UserSortFieldEnum> {
  @IsOptional()
  @IsEnum(UserSortFieldEnum)
  declare sortBy?: UserSortFieldEnum;
}
