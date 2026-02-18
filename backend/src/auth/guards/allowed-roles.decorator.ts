import { user_role } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: user_role[]) => SetMetadata(ROLES_KEY, roles);
