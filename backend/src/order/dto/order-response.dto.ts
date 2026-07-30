import { ApiProperty } from '@nestjs/swagger';
import { order_status } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty({ example: '0763f1' })
  publicId: string;

  @ApiProperty({ example: 3 })
  amount: number;

  @ApiProperty({ example: 'PENDING' })
  status: order_status;

  @ApiProperty({ example: 'ea60f1ea' })
  buyerId: string;

  @ApiProperty({ example: '26f05569' })
  sellerId: string;

  @ApiProperty({ example: '82d04b87' })
  itemId: string;

  @ApiProperty({ example: '2000-01-01T12:00:00.000Z' })
  createdAt: Date;
}
