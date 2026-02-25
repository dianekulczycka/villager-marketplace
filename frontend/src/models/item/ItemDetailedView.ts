import { ItemView } from './ItemView.ts';
import { UserPublicView } from '../user/UserPublicView.ts';

export type ItemDetailedView = ItemView & {
  description: string,
  seller: UserPublicView
}