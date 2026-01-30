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
import { ItemNameEnum } from '../const/enums/item-name.enum';

export class CreateItemDto {
  @IsEnum(ItemNameEnum)
  name: ItemNameEnum;

  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  price: number;

  @IsNumber()
  @Min(1)
  @Max(64)
  count: number;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  description: string;
}
