import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto';

export function ApiErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      example: {
        statusCode: 400,
        timestamp: '2099-01-01T00:00:00.000Z',
        path: '/some_path',
        errors: 'Bad request',
      },
    }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      example: {
        statusCode: 401,
        timestamp: '2099-01-01T00:00:00.000Z',
        path: '/some_path',
        errors: 'Unauthorized',
      },
    }),
    ApiForbiddenResponse({
      type: ErrorResponseDto,
      example: {
        statusCode: 403,
        timestamp: '2099-01-01T00:00:00.000Z',
        path: '/some_path',
        errors: 'Forbidden',
      },
    }),
    ApiNotFoundResponse({
      type: ErrorResponseDto,
      example: {
        statusCode: 404,
        timestamp: '2099-01-01T00:00:00.000Z',
        path: '/some_path',
        errors: 'Not found',
      },
    }),
  );
}
