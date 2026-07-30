import crypto from 'crypto';

export function generatePublicId(): string {
  return crypto.randomBytes(4).toString('hex');
}
