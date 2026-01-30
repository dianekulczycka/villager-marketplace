import { Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT } from '../const/orm/user';

export type UserPublicDto = Prisma.userGetPayload<{
  select: typeof USER_PUBLIC_SELECT;
}>;
