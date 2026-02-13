import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: '2026-02-13T14:49:53.397Z' })
  timestamp: string;

  @ApiProperty({ example: '/auth/register' })
  path: string;

  @ApiProperty({ example: 'Bad language used' })
  errors: string;
}
