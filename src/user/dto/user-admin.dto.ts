import { user } from '@prisma/client';

export type UserAdminDto = Omit<user, 'password'>;
