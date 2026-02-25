import { Prisma, user_role, user_sellerType } from '@prisma/client';

export const USER_PUBLIC_SELECT: Prisma.userSelect = {
  id: true,
  username: true,
  iconUrl: true,
  role: true,
  sellerType: true,
  createdAt: true,
};

export const USER_SELF_SELECT: Prisma.userSelect = {
  ...USER_PUBLIC_SELECT,
  email: true,
  isBanned: true,
  bannedAt: true,
};

export const USER_BAN_DATA = (bannedBy: string): Prisma.userUpdateInput => ({
  isBanned: 1,
  bannedBy,
  bannedAt: new Date(),
});

export const USER_UNBAN_DATA: Prisma.userUpdateInput = {
  isFlagged: 0,
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

export const ADMIN_USER_SELECT: Prisma.userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  iconUrl: true,
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
  _count: {
    select: {
      item: true,
    },
  },
};

export const ADMIN_ALL_USERS_WHERE: Prisma.userWhereInput = {
  role: {
    not: user_role.ADMIN,
  },
};

export const ADMIN_FLAGGED_USERS_WHERE: Prisma.userWhereInput = {
  isFlagged: 1,
  isDeleted: 0,
};

export const ADMIN_BANNED_USERS_WHERE: Prisma.userWhereInput = {
  isBanned: 1,
  isDeleted: 0,
};

export const ADMIN_MANAGERS_WHERE: Prisma.userWhereInput = {
  role: user_role.MANAGER,
  isDeleted: 0,
};

export const USER_PUBLIC_WHERE_BASE: Prisma.userWhereInput = {
  role: user_role.SELLER,
  isDeleted: 0,
  isBanned: 0,
};

export function buildUserPublicSearchWhere(
  search?: string,
): Prisma.userWhereInput {
  if (!search) return {};

  const searchNumber = Number(search);
  const searchDate = new Date(search);

  const or: Prisma.userWhereInput[] = [{ username: { contains: search } }];

  if (Object.values(user_sellerType).includes(search as user_sellerType)) {
    or.push({ sellerType: search as user_sellerType });
  }

  if (!isNaN(searchNumber)) {
    or.push({ id: searchNumber });
  }

  if (!isNaN(searchDate.getTime())) {
    or.push({
      createdAt: {
        gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      },
    });
  }

  return { OR: or };
}
