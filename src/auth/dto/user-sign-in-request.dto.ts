import { IsEmail, Matches } from 'class-validator';

export class UserSignInRequestDto {
  @IsEmail()
  email: string;
  @Matches(/^(?=.*\d)[A-Za-z\d]{6,20}$/, {
    message:
      'Password must be 6-20 chars, contain Latin letters only, and include AT LEAST one number',
  })
  password: string;

  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars and contain Latin letters only',
  })
  username: string;
}
