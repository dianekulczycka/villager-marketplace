import type { ItemView } from './ItemView.ts';
import type { UserPublicView } from '../user/UserPublicView.ts';

export type ItemDetailedView = ItemView & {
  description: string,
  seller: UserPublicView
}