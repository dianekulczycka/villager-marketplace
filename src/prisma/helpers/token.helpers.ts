import { Prisma } from '@prisma/client';

export const TOKEN_ACTIVE_WHERE = (
  refreshToken: string,
): Prisma.tokenWhereInput => ({
  refreshToken,
  isBlocked: 0,
});

export const TOKEN_BLOCK_DATA: Prisma.tokenUpdateManyMutationInput = {
  isBlocked: 1,
};
