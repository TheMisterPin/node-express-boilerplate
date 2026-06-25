import { conflict, notFound } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './categories.types'
import { Prisma } from '@prisma/client'

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
} as const

type CategoryRecord = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>

function toDto(record: CategoryRecord): CategoryDto {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    organizationId: record.organizationId,
    productCount: record._count.products,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function listCategories(
  organizationId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<CategoryDto>> {
  const result = await paginate<CategoryRecord>(
    asPaginateDelegate(prisma.category),
    {
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
      select: categorySelect,
    },
    page,
    limit,
  )
  return { data: result.data.map(toDto), meta: result.meta }
}

export async function findCategoryById(
  id: string,
  organizationId: string,
): Promise<CategoryDto | null> {
  const category = await prisma.category.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: categorySelect,
  })
  return category ? toDto(category) : null
}

export async function createCategory(
  organizationId: string,
  data: CreateCategoryDto,
): Promise<CategoryDto> {
  try {
    const category = await prisma.category.create({
      data: {
        organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
      },
      select: categorySelect,
    })
    return toDto(category)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('slug')
    }
    throw error
  }
}

export async function updateCategory(
  id: string,
  organizationId: string,
  data: UpdateCategoryDto,
): Promise<CategoryDto> {
  try {
    const category = await prisma.category.update({
      where: { id, organizationId, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
      select: categorySelect,
    })
    return toDto(category)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('slug')
      if (error.code === 'P2025') throw notFound('Category')
    }
    throw error
  }
}

export async function countCategoryProducts(
  id: string,
  organizationId: string,
): Promise<number> {
  return prisma.product.count({
    where: { categoryId: id, organizationId, deletedAt: null },
  })
}

export async function softDeleteCategory(id: string, organizationId: string): Promise<void> {
  const result = await prisma.category.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('Category')
  }
}
