import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UserRequest } from '../../user/interfaces/user-request.interface';

@Injectable()
export class RequestDetailsLoggerInteceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started = Date.now();

    const request = context.switchToHttp().getRequest<UserRequest>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.switchToHttp().getResponse();

    const { method, originalUrl, ip } = request;

    return next.handle().pipe(
      tap(() => {
        const user: string = request.user
          ? `USER_ID: ${request.user.userId}`
          : 'USER: unknown';
        const role: string = request.user
          ? `ROLE: ${request.user.role.toLowerCase()}`
          : '';
        console.log(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `${method} ${originalUrl}, STATUS: ${response.statusCode}, TIME: ${new Date().toISOString()}, DURATION: ${Date.now() - started} ms, ${user}, ${role}, IP: ${ip}`,
        );
      }),
    );
  }
}
