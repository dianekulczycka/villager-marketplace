import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItemNameEnum } from '../enums/item-name.enum';

export class CreateItemDto {
  @ApiProperty({ example: 'leather', enum: ItemNameEnum })
  @IsEnum(ItemNameEnum)
  name: ItemNameEnum;

  @ApiProperty({ example: 13 })
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  price: number;

  @ApiProperty({ example: 63 })
  @IsNumber()
  @Min(1)
  @Max(64)
  count: number;

  @ApiProperty({ required: false, example: 'some nice leather' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
