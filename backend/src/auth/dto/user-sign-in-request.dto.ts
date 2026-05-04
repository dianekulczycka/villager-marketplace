import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignInRequestDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password1' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,20}$/, {
    message:
      'Password must be 6-20 chars and include one number and one letter',
  })
  password: string;

  @ApiProperty({ example: 'john' })
  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars',
  })
  username: string;
}
