import type {UserSelfView} from './UserSelfView.ts';
import type {UserRole} from "../enums/UserRole.ts";

export type UserAdminView = UserSelfView & {
    role: UserRole,
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

