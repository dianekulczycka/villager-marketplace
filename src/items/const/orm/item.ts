import { item_name, Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT } from '../../../user/const/orm/user';

export const ITEM_OWNER_SELECT: Prisma.itemSelect = {
  id: true,
  sellerId: true,
};

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
  description: true,
  iconUrl: true,
  views: true,
  seller: {
    select: USER_PUBLIC_SELECT,
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
