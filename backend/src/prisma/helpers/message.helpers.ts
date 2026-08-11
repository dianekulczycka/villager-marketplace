import { Prisma } from '@prisma/client';

export const MESSAGE_PUBLIC_SELECT: Prisma.messageSelect = {
  uuid: true,
  body: true,
  createdAt: true,
  recipient: {
    select: {
      publicId: true,
    },
  },
  sender: {
    select: {
      publicId: true,
    },
  },
};

export const MESSAGE_PARTICIPANTS_SELECT: Prisma.messageSelect = {
  senderId: true,
  recipientId: true,
};

export const buildUserMessagesWhere = (
  userId: number,
): Prisma.messageWhereInput => ({
  OR: [{ senderId: userId }, { recipientId: userId }],
});

export const buildChatWhere = (
  userId: number,
  otherUserId: number,
): Prisma.messageWhereInput => ({
  OR: [
    {
      senderId: userId,
      recipientId: otherUserId,
    },
    {
      senderId: otherUserId,
      recipientId: userId,
    },
  ],
});
