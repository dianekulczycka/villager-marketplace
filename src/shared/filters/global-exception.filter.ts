import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  cleanMessage(msg: unknown): string {
    if (!msg) return 'Internal server error';

    if (Array.isArray(msg)) return msg.map(String).join(', ');

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const text = String(msg);
    const lines: string[] = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines[lines.length - 1] ?? 'Internal server error';
  }

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      path: httpAdapter.getRequestUrl(ctx.getRequest()),

      errors: this.cleanMessage(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        exception.response?.message || exception.message,
      ),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
