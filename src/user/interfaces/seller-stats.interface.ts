import { item_name } from '@prisma/client';

export interface ISellerStats {
  totalItems: number;
  activeItems: number;
  totalViews: number;
  mostViewedItem: {
    id: number;
    name: item_name;
    views: number;
  } | null;
}
