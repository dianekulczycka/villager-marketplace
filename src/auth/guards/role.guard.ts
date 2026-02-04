import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { user_role } from '@prisma/client';
import { IUserRequest } from '../../user/interfaces/user-request.interface';
import { AUTH_ERRORS } from '../const/errors';

@Injectable()
export class AllowedRolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: user_role[]) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const user = req.user;

    if (!user || !this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException(AUTH_ERRORS.FORBIDDEN_BY_ROLE(user?.role));
    }

    return true;
  }
}
