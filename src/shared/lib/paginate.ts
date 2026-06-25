import type { PaginatedResult } from '@/shared/types/common'

// WHY: Loosely typed delegate accommodates Prisma extended client without importing generated types here.
export interface PaginateDelegate<T> {
  findMany: (args: object) => Promise<T[]>
  count: (args: { where?: unknown }) => Promise<number>
}

interface PaginateArgs {
  where?: unknown
  orderBy?: unknown
  select?: unknown
  include?: unknown
}

export async function paginate<T>(
  delegate: PaginateDelegate<T>,
  args: PaginateArgs,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(Math.max(1, limit), 100)
  const skip = (safePage - 1) * safeLimit

  const [data, total] = await Promise.all([
    delegate.findMany({
      ...args,
      skip,
      take: safeLimit,
    }),
    delegate.count({ where: args.where }),
  ])

  const totalPages = Math.ceil(total / safeLimit) || 1

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  }
}

export function asPaginateDelegate<T>(delegate: object): PaginateDelegate<T> {
  return delegate as PaginateDelegate<T>
}
