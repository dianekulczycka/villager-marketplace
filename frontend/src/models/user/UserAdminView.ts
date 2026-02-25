import type { UserSelfView } from './UserSelfView.ts';

export type UserAdminView = UserSelfView & {
  role: string,
  bannedBy: string | null,
  isFlagged: boolean,
  isDeleted: boolean,
  deletedBy: string | null,
  deletedAt: string | null,
  updatedAt: string | null,
  _count: {
    item: number
  }
}

