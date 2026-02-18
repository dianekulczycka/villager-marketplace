import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignInRequestDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password1' })
  @Matches(/^(?=.*\d)[A-Za-z\d]{6,20}$/, {
    message:
      'Password must be 6-20 chars, contain Latin letters only, and include AT LEAST one number',
  })
  password: string;

  @ApiProperty({ example: 'john' })
  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars and contain Latin letters only',
  })
  username: string;
}
