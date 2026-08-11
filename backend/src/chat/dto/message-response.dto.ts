import { Prisma } from '@prisma/client';
import { MESSAGE_PUBLIC_SELECT } from '../../prisma/helpers/message.helpers';

export type MessageResponseDto = Prisma.messageGetPayload<{
  select: typeof MESSAGE_PUBLIC_SELECT;
}>;
