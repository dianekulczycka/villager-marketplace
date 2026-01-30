import { PrismaPromise } from '@prisma/client';

type PrismaDelegate = {
  findMany: (args: any) => PrismaPromise<any[]>;
  count: (args: any) => PrismaPromise<number>;
};

interface IParams {
  where?: unknown;
  orderBy?: unknown;
  select?: unknown;
  include?: unknown;
  page: number;
  perPage: number;
}

export async function prismaPaginator<T>(
  model: PrismaDelegate,
  params: IParams,
): Promise<{ data: T[]; total: number }> {
  const { where, orderBy, select, include, page, perPage } = params;

  const skip = (page - 1) * perPage;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      select,
      include,
      skip,
      take: perPage,
    }),
    model.count({ where }),
  ]);

  return { data: data as T[], total };
}
