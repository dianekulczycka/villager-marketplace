import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class BuyItemDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  @Max(64)
  amount: number;
}
