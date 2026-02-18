import { Prisma } from '@prisma/client';
import { USER_SELF_SELECT } from '../../prisma/helpers/user.helpers';

export type UserSelfDto = Prisma.userGetPayload<{
  select: typeof USER_SELF_SELECT;
}>;
