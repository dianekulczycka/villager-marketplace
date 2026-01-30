import { IsEnum } from 'class-validator';
import { SellerTypeEnum } from '../const/enums/seller-type.enum';

export class BecomeSellerRequestDto {
  @IsEnum(SellerTypeEnum)
  sellerType: SellerTypeEnum;
}
