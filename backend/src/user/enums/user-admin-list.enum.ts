import { Prisma } from '@prisma/client';
import {
  ADMIN_BANNED_USERS_WHERE,
  ADMIN_FLAGGED_USERS_WHERE,
  ADMIN_MANAGERS_WHERE,
} from '../../prisma/helpers/user.helpers';

export enum UserAdminListEnum {
  FLAGGED,
  BANNED,
  MANAGERS,
}

export const whereMap: Record<UserAdminListEnum, Prisma.userWhereInput> = {
  [UserAdminListEnum.FLAGGED]: ADMIN_FLAGGED_USERS_WHERE,
  [UserAdminListEnum.BANNED]: ADMIN_BANNED_USERS_WHERE,
  [UserAdminListEnum.MANAGERS]: ADMIN_MANAGERS_WHERE,
};
