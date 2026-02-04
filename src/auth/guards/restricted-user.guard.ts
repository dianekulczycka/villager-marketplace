import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRequest } from '../../user/interfaces/user-request.interface';
import { USER_ERRORS } from '../../user/const/errors';

@Injectable()
export class RestrictedUserGuard implements CanActivate {
  private readonly allowedPath = '/users/account-recovery';

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const userId = req.user?.userId;

    if (!userId) return true;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true, isDeleted: true },
    });

    if (!user) {
      throw new ForbiddenException(USER_ERRORS.USER_RESTRICTED);
    }

    if (user.isBanned || user.isDeleted) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const path = req.route?.path || req.originalUrl;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      if (!path.startsWith(this.allowedPath)) {
        throw new ForbiddenException(USER_ERRORS.USER_RESTRICTED);
      }
    }

    return true;
  }
}
