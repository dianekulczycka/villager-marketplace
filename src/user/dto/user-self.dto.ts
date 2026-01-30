import { Prisma } from '@prisma/client';
import { USER_SELF_SELECT } from '../const/orm/user';

export type UserSelfDto = Prisma.userGetPayload<{
  select: typeof USER_SELF_SELECT;
}>;
