import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { user_role } from '@prisma/client';
import { UserRoleEnum } from '../../user/const/enums/user-role.enum';
import { IUserRequest } from '../../user/interfaces/user-request.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const user = req.user;

    if (user?.role !== user_role.ADMIN) {
      throw new ForbiddenException(`${UserRoleEnum.ADMIN} only`);
    }

    return true;
  }
}

@Injectable()
export class ManagerOrAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const user = req.user;

    if (user?.role !== user_role.ADMIN && user?.role !== user_role.MANAGER) {
      throw new ForbiddenException(
        `${UserRoleEnum.ADMIN}  or ${UserRoleEnum.MANAGER}  only`,
      );
    }

    return true;
  }
}

@Injectable()
export class SellerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const user = req.user;

    if (user?.role !== user_role.SELLER) {
      throw new ForbiddenException(`${UserRoleEnum.SELLER} only`);
    }

    return true;
  }
}
