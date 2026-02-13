import { user_role } from '@prisma/client';

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_TOKEN: 'Invalid or expired token',
  AUTH_REQUIRED: 'Authentication required',
  ACCOUNT_DELETED:
    'Account is deleted or banned. Contact managers using recovery request',
  FORBIDDEN_BY_ROLE: (r: user_role | user_role[]) =>
    `${[].concat(r as any).join(', ')} not allowed`,
};
