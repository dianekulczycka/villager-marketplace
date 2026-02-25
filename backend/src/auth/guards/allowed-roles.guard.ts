import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { user_role } from '@prisma/client';
import { UserRequest } from '../../user/interfaces/user-request.interface';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './allowed-roles.decorator';
import { AUTH_ERRORS } from '../../shared/errors/auth.errors';

@Injectable()
export class AllowedRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<user_role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!roles?.length) return true;

    const req = ctx.switchToHttp().getRequest<Request & UserRequest>();
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException(AUTH_ERRORS.FORBIDDEN_BY_ROLE(user?.role));
    }

    return true;
  }
}
