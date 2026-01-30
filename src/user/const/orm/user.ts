import { Prisma, user_role } from '@prisma/client';

export const USER_PUBLIC_SELECT: Prisma.userSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  sellerType: true,
  createdAt: true,
};

export const USER_SELF_SELECT: Prisma.userSelect = {
  ...USER_PUBLIC_SELECT,
  isBanned: true,
  bannedAt: true,
};

export const USER_ADMIN_SELECT: Prisma.userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  avatarUrl: true,
  sellerType: true,
  isBanned: true,
  bannedBy: true,
  bannedAt: true,
  isFlagged: true,
  isDeleted: true,
  deletedBy: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

export const USER_PUBLIC_WHERE_BASE: Prisma.userWhereInput = {
  role: user_role.SELLER,
  isBanned: 0,
  isFlagged: 0,
  isDeleted: 0,
};

export const USER_SELF_WHERE_BASE: Prisma.userWhereInput = {
  isDeleted: 0,
};

export const USER_FLAGGED_WHERE_BASE: Prisma.userWhereInput = {
  isFlagged: 1,
  isDeleted: 0,
};

export const USER_MANAGER_SELECT: Prisma.userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
};

export const USER_BAN_DATA = (bannedBy: string): Prisma.userUpdateInput => ({
  isBanned: 1,
  bannedBy,
  bannedAt: new Date(),
});

export const USER_UNBAN_DATA: Prisma.userUpdateInput = {
  isBanned: 0,
  bannedBy: null,
  bannedAt: null,
};

export const USER_SOFT_DELETE_DATA = (
  deletedBy: string,
): Prisma.userUpdateInput => ({
  isDeleted: 1,
  deletedBy,
  deletedAt: new Date(),
});
