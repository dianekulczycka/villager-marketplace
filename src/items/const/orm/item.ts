import { Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT } from '../../../user/const/orm/user';

export const ITEM_PUBLIC_SELECT: Prisma.itemSelect = {
  id: true,
  name: true,
  price: true,
  count: true,
  description: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: USER_PUBLIC_SELECT,
  },
};

export const ITEM_PUBLIC_WHERE_BASE: Prisma.itemWhereInput = {
  isDeleted: 0,
};

export const ITEM_OWNER_WHERE = (itemId: number, userId: number) => ({
  id: itemId,
  sellerId: userId,
  isDeleted: 0,
});

export const ITEM_PUBLIC_INCLUDE = {
  seller: {
    select: USER_PUBLIC_SELECT,
  },
};

export const ITEM_OWNER_SELECT = {
  id: true,
  sellerId: true,
};

export const ITEM_SOFT_DELETE_DATA: Prisma.itemUpdateInput = {
  isDeleted: 1,
};

export const ITEM_INCREMENT_VIEW_DATA: Prisma.itemUpdateInput = {
  views: { increment: 1 },
};

export const ITEM_SOFT_DELETE_BY_SELLER = (userId: number) => ({
  sellerId: userId,
});

export const ITEM_HARD_DELETE_BY_SELLER = (userId: number) => ({
  sellerId: userId,
});
