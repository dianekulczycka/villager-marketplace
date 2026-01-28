import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ItemNameEnum } from '../enums/item-name.enum';

export class CreateItemDto {
  @IsString()
  name: ItemNameEnum;

  @IsNumber()
  @Min(0.01)
  @Max(99_999_999.99)
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
