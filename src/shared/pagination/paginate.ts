import { IPaginatedResponse } from './pagination-response.interface';
import { BadRequestException } from '@nestjs/common';

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
): IPaginatedResponse<T> {
  const pageCount = Math.ceil(total / perPage);

  if (page < 1 || perPage < 1) {
    throw new BadRequestException('Invalid parameters');
  }

  if (page > pageCount && pageCount > 0) {
    throw new BadRequestException(
      `Page ${page} does not exist. There is only ${pageCount}`,
    );
  }

  return {
    data,
    page,
    perPage,
    total,
    pageCount,
    nextPage: page < pageCount ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}
