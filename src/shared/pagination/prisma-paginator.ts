import { PrismaPromise } from '@prisma/client';
import { IPaginatedResponse } from './pagination-response.interface';

export async function paginatePrisma<T>(
  model: {
    findMany: (args: any) => PrismaPromise<any[]>;
    count: (args: any) => PrismaPromise<number>;
  },
  options: {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
  },
  page = 1,
  perPage = 10,
): Promise<IPaginatedResponse<T>> {
  const skip = (page - 1) * perPage;

  const [data, total] = await Promise.all([
    model.findMany({
      ...options,
      skip,
      take: perPage,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    model.count({ where: options.where }),
  ]);

  const pageCount = Math.ceil(total / perPage);

  return {
    data: data as T[],
    page,
    perPage,
    total,
    pageCount,
    nextPage: page < pageCount ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}
