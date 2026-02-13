import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SellerTypeEnum } from '../enums/seller-type.enum';

export class BecomeSellerRequestDto {
  @ApiProperty({ example: 'MASON', enum: SellerTypeEnum })
  @IsEnum(SellerTypeEnum)
  sellerType: SellerTypeEnum;
}
