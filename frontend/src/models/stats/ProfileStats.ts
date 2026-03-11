export interface IBuyerStats {
  role: 'BUYER';
  totalItems: number;
}

export interface ISellerStats {
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

export interface IAdminStats {
  role: 'ADMIN' | 'MANAGER';
  totalUsers: number;
  totalSellers: number;
  totalFlagged: number;
  totalBanned: number;
  totalItems: number;
}

export type ProfileStats = IBuyerStats | ISellerStats | IAdminStats;