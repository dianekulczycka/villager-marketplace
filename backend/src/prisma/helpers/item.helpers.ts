import { item_name, Prisma } from '@prisma/client';
import { ADMIN_USER_SELECT, USER_PUBLIC_SELECT } from './user.helpers';

export const ITEM_SOFT_DELETE_DATA: Prisma.itemUpdateInput = {
  isDeleted: 1,
};

export const ITEM_PUBLIC_WHERE_BASE: Prisma.itemWhereInput = {
  isDeleted: 0,
};

export const ITEM_PUBLIC_SELECT: Prisma.itemSelect = {
  id: true,
  name: true,
  price: true,
  count: true,
  iconUrl: true,
  views: true,
};

export const ITEM_PUBLIC_DETAILED_SELECT: Prisma.itemSelect = {
  id: true,
  name: true,
  price: true,
  count: true,
  description: true,
  iconUrl: true,
  views: true,
  seller: {
    select: USER_PUBLIC_SELECT,
  },
};

export const ITEM_ADMIN_SELECT: Prisma.itemSelect = {
  id: true,
  name: true,
  price: true,
  count: true,
  description: true,
  iconUrl: true,
  views: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: ADMIN_USER_SELECT,
  },
};

export const buildItemSearchWhere = (
  search?: string,
): Prisma.itemWhereInput | undefined => {
  if (!search) return undefined;

  const matchedNames = Object.values(item_name).filter((val) =>
    val.includes(search.toLowerCase()),
  );

  const or: Prisma.itemWhereInput[] = [
    {
      description: {
        contains: search,
      },
    },
  ];

  if (matchedNames.length) {
    or.push({
      name: {
        in: matchedNames,
      },
    });
  }

  return { OR: or };
};
