import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: '2000-01-01T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/auth/register' })
  path: string;

  @ApiProperty({ example: 'Bad language used' })
  errors: string;
}
