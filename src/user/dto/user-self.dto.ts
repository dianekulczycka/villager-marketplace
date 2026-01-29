import { UserPublicDto } from './user-public.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserSelfDto extends UserPublicDto {
  @Expose() isBanned: boolean;
  @Expose() bannedAt?: Date;
}
