import { Prisma } from '@prisma/client';
import { ORDER_PUBLIC_SELECT } from '../../prisma/helpers/order.helpers';

export type OrderResponseDto = Prisma.orderGetPayload<{
  select: typeof ORDER_PUBLIC_SELECT;
}>;
