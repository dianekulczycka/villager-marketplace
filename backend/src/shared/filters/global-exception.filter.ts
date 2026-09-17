import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private cleanMessage(msg: unknown): string {
    if (!msg) return 'Internal server error';

    if (Array.isArray(msg)) {
      return msg.map((m) => this.cleanMessage(m)).join(', ');
    }

    if (typeof msg === 'string') {
      const lines = msg
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      return lines[lines.length - 1] ?? 'Internal server error';
    }

    if (msg instanceof Error) {
      return msg.message;
    }

    if (typeof msg === 'object') {
      try {
        return JSON.stringify(msg);
      } catch {
        return 'Internal server error';
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(msg);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected server error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();

      const response = exception.getResponse() as
        | string
        | { message?: unknown };

      const responseMessage =
        typeof response === 'string'
          ? response
          : (response?.message ?? exception.message);

      message = this.cleanMessage(responseMessage);
    } else if (
      exception instanceof Error &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (exception as any).code === 'EAUTH'
    ) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Email service auth failed';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(exception);

      httpStatus = HttpStatus.CONFLICT;
      message = 'Database error';
    }

    if (httpStatus === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      console.error(exception);
    }

    const request = ctx.getRequest<{ url: string }>();
    const path = request.url;

    const responseBody: {
      statusCode: number;
      timestamp: string;
      path: string;
      errors: string;
    } = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
      errors: message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
