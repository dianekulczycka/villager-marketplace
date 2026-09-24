import { user_role } from '@prisma/client';

export const AUTH_ERRORS = {
  FORBIDDEN_BY_ROLE: (role: user_role) => `${role} not allowed`,
  EMAIL_UNAVAILABLE: 'Unable to create an account with this email',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_UNAVAILABLE:
    'Unable to sign in. Please contact support using recovery form',
  INVALID_TOKEN: 'Invalid or expired session',
  RECOVERY_REQUEST_ACCEPTED:
    'If an account exists for this email, recovery info will be sent',
};
