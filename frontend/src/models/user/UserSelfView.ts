import type { UserPublicView } from './UserPublicView.ts';

export type UserSelfView = UserPublicView & {
  email: string
  isBanned: boolean,
  bannedAt: string | null
}