import { Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT } from '../../prisma/helpers/user.helpers';

export type UserPublicDto = Prisma.userGetPayload<{
  select: typeof USER_PUBLIC_SELECT;
}>;
