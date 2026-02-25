import { user_role } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  email: string;
  role: user_role;
  jti: string;
  iat?: number;
  exp?: number;
}
