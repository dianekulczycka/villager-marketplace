import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'new john' })
  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars and contain Latin letters only',
  })
  username?: string;
}
