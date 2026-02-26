import type { UserPublicView } from './UserPublicView.ts';

export type UserSelfView = UserPublicView & {
  email: string
  isBanned: 1 | 0,
  bannedAt: string | null
}