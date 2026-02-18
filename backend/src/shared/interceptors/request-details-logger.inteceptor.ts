import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestDetailsLoggerInteceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap(() => {
        const status = res.statusCode;
        const time = Date.now() - now;

        console.log(
          `${method} ${originalUrl}, status: ${status}, time: ${time} mls`,
        );
      }),
    );
  }
}
