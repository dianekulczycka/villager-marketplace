import {
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

export class UpdateItemDto {
  @ApiProperty({ required: false, example: 'leather', enum: ItemNameEnum })
  @IsString()
  @IsOptional()
  name?: ItemNameEnum;

  @ApiProperty({ required: false, example: 14 })
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsNumber()
  @Min(1)
  @Max(64)
  @IsOptional()
  count?: number;

  @ApiProperty({ required: false, example: 'some nice leather' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
