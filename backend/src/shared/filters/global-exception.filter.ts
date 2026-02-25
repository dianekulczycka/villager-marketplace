import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  cleanMessage(msg: unknown): string {
    if (!msg) return 'Internal server error';

    if (Array.isArray(msg)) return msg.map(String).join(', ');

    const text = String(msg);
    const lines: string[] = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines[lines.length - 1] ?? 'Internal server error';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      message = this.cleanMessage(res?.message ?? exception.message);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          httpStatus = HttpStatus.CONFLICT;
          message = 'Already exists';
          break;
        }
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Not found';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Db error';
      }
    } else {
      message = 'Unexpected server error';
    }

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      errors: message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
