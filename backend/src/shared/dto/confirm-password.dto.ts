import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmPasswordDto {
  @ApiProperty({ example: 'password1' })
  @IsString()
  password: string;
}
