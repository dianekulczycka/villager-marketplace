import { PaginationRequestDto } from '../../shared/pagination/pagination-request.dto';
import { IsEnum, IsOptional } from 'class-validator';

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

export class UserQueryDto extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(UserSortFieldEnum)
  sortBy?: UserSortFieldEnum;
}
