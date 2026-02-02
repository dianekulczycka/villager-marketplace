import { Matches } from 'class-validator';

export class UpdateUserDto {
  @Matches(/^[A-Za-z0-9\s]{2,}$/, {
    message: 'Name must be gt 2 chars and contain Latin letters only',
  })
  username?: string;
}
