import { Expose, Exclude } from 'class-transformer';
import { SellerTypeEnum } from '../enums/seller-type.enum';

@Exclude()
export class UserPublicDto {
  @Expose() id: number;
  @Expose() username: string;
  @Expose() avatarUrl: string;
  @Expose() sellerType: SellerTypeEnum;
  @Expose() createdAt: Date;
}
