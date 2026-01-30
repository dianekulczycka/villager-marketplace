import { Prisma } from '@prisma/client';
import { ITEM_PUBLIC_SELECT } from '../const/orm/item';

export type ItemPublicDto = Prisma.itemGetPayload<{
  select: typeof ITEM_PUBLIC_SELECT;
}>;
