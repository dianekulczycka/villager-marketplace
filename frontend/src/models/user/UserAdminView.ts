import type { UserSelfView } from './UserSelfView.ts';

export type UserAdminView = UserSelfView & {
  role: string,
  bannedBy: string | null,
  isFlagged: 1 | 0,
  isDeleted: 1 | 0,
  deletedBy: string | null,
  deletedAt: string | null,
  updatedAt: string | null,
  _count: {
    item: number
  }
}

