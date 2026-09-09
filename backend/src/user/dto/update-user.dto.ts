import { IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new john' })
  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars and contain Latin letters only',
  })
  @IsOptional()
  username?: string;
}
