import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRequest } from '../../user/interfaces/user-request.interface';
import { USER_ERRORS } from '../errors/user.errors';
import { validateExists } from '../helpers/validate-exists';

@Injectable()
export class RestrictedUserGuard implements CanActivate {
  private readonly allowedPath = '/users/account-recovery';

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & UserRequest>();

    const user = validateExists(
      await this.prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: { isBanned: true, isDeleted: true },
      }),
      USER_ERRORS.RESTRICTED,
    );

    if (user.isBanned || user.isDeleted) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const path = req.route?.path || req.originalUrl;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      if (!path.startsWith(this.allowedPath)) {
        throw new ForbiddenException(USER_ERRORS.RESTRICTED);
      }
    }

    return true;
  }
}
