import { IsEmail, Matches } from 'class-validator';

export class UserSignInRequestDto {
  @IsEmail()
  email: string;
  @Matches(/^(?=.*\d)[A-Za-z\d]{6,20}$/, {
    message:
      'Password must be 6-20 chars, contain ONLY English letters, and include AT LEAST one number',
  })
  password: string;

  @Matches(/^[A-Za-z\s]{2,}$/, {
    message: 'Name must be gt 2 letters and contain ONLY English letters',
  })
  username: string;
}
