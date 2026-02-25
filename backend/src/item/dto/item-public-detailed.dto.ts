import { Prisma } from '@prisma/client';
import { ITEM_PUBLIC_SELECT } from '../../prisma/helpers/item.helpers';

export type ItemPublicDetailedDto = Prisma.itemGetPayload<{
  select: typeof ITEM_PUBLIC_SELECT;
}>;
