import { UserPublicDto } from '../../user/dto/user-public.dto';

export type ChatPublicDto = UserPublicDto & {
  unreadMessages: number;
};
