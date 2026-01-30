import { Matches } from 'class-validator';

export class UpdateUserDto {
  @Matches(/^[A-Za-z\s]{2,}$/, {
    message: 'Name must be gt 2 letters and contain ONLY English letters',
  })
  username?: string;
}
