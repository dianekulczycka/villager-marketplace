import { UserRequest } from '../../user/interfaces/user-request.interface';
import { user_role } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { USER_ERRORS } from '../errors/user.errors';
import { PrismaService } from '../../prisma/prisma.service';
import { ITEM_ERRORS } from '../errors/item.errors';

export function canModifyUser(
  request: UserRequest,
  targetId: number,
  targetRole: user_role,
) {
  const actorId = request.user.userId;
  const actorRole = request.user.role;
  const isSelf = actorId === targetId;

  if (actorRole === user_role.BUYER || actorRole === user_role.SELLER) {
    if (!isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    return;
  }

  if (actorRole === user_role.MANAGER) {
    if (
      !isSelf &&
      (targetRole === user_role.ADMIN || targetRole === user_role.MANAGER)
    ) {
      throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    }
    return;
  }

  if (actorRole === user_role.ADMIN) {
    if (isSelf) throw new ForbiddenException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    return;
  }
}

export async function canModifyItem(
  prisma: PrismaService,
  request: UserRequest,
  publicId: string,
) {
  const { userId, role } = request.user;

  const item = await prisma.item.findUnique({
    where: { publicId },
    select: {
      id: true,
      sellerId: true,
    },
  });

  if (!item) throw new NotFoundException(ITEM_ERRORS.NOT_FOUND);

  if (
    role !== user_role.ADMIN &&
    role !== user_role.MANAGER &&
    item.sellerId !== userId
  ) {
    throw new ForbiddenException(ITEM_ERRORS.NOT_ALLOWED);
  }

  return item;
}

export async function resolveTargetUser(
  prisma: PrismaService,
  request: UserRequest,
  targetUserPublicId?: string,
): Promise<{ id: number; role: user_role }> {
  if (!targetUserPublicId) {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: { id: true, role: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    return user;
  }

  const user = await prisma.user.findUnique({
    where: { publicId: targetUserPublicId },
    select: { id: true, role: true },
  });

  if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

  return user;
}
