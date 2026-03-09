import type { ItemDetailedView } from './ItemDetailedView.ts';
import type { UserAdminView } from '../user/UserAdminView.ts';

export type ItemAdminView = ItemDetailedView & {
  isDeleted: 1 | 0,
  createdAt: string,
  updatedAt: string,
  seller: UserAdminView
};