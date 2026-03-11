export interface BuyerStats {
  role: 'BUYER';
  totalItems: number;
}

export interface SellerStats {
  role: 'SELLER';
  totalItems: number;
  activeItems: number;
  totalViews: number;
  mostViewedItem: {
    id: number;
    name: string;
    views: number;
  } | null;
}

export interface AdminStats {
  role: 'ADMIN' | 'MANAGER';
  totalUsers: number;
  totalSellers: number;
  totalFlagged: number;
  totalBanned: number;
  totalItems: number;
}

export type ProfileStats = BuyerStats | SellerStats | AdminStats;
