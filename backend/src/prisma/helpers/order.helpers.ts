import { Prisma } from '@prisma/client';

export const ORDER_PUBLIC_SELECT: Prisma.orderSelect = {
  publicId: true,
  amount: true,
  status: true,
  createdAt: true,

  buyer: {
    select: {
      publicId: true,
    },
  },

  seller: {
    select: {
      publicId: true,
    },
  },

  item: {
    select: {
      publicId: true,
    },
  },
};
