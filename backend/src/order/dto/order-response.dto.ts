import { ApiProperty } from '@nestjs/swagger';
import { order_status } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  amount: number;

  @ApiProperty({ example: 'PENDING' })
  status: order_status;

  @ApiProperty({ example: 1 })
  buyerId: number;

  @ApiProperty({ example: 2 })
  sellerId: number;

  @ApiProperty({ example: 5 })
  itemId: number;

  @ApiProperty({ example: '2000-01-01T12:00:00.000Z' })
  createdAt: Date;
}
