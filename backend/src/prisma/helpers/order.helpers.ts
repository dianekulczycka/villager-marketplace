import { Prisma } from '@prisma/client';

export const ORDER_PUBLIC_SELECT: Prisma.orderSelect = {
  publicId: true,
  amount: true,
  status: true,
  createdAt: true,

  buyer: {
    select: {
      publicId: true,
      username: true,
    },
  },

  seller: {
    select: {
      publicId: true,
      username: true,
    },
  },

  item: {
    select: {
      publicId: true,
      name: true,
      isDeleted: true,
    },
  },
};
