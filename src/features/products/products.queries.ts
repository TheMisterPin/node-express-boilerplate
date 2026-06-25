import { conflict, notFound } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from './products.types'
import type { ListProductsInput } from './products.schema'
import { Prisma } from '@prisma/client'

const productSelect = {
  id: true,
  name: true,
  description: true,
  sku: true,
  price: true,
  isActive: true,
  categoryId: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const

type ProductRecord = Prisma.ProductGetPayload<{ select: typeof productSelect }>

function toDto(record: ProductRecord): ProductDto {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    sku: record.sku,
    price: record.price.toString(),
    isActive: record.isActive,
    categoryId: record.categoryId,
    categoryName: record.category.name,
    organizationId: record.organizationId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function buildWhere(organizationId: string, query: ListProductsInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    organizationId,
    deletedAt: null,
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return where
}

function buildOrderBy(query: ListProductsInput): Prisma.ProductOrderByWithRelationInput {
  const sortBy = query.sortBy ?? 'createdAt'
  const sortOrder = query.sortOrder ?? 'desc'
  return { [sortBy]: sortOrder }
}

export async function listProducts(
  organizationId: string,
  query: ListProductsInput,
): Promise<PaginatedResult<ProductDto>> {
  const where = buildWhere(organizationId, query)
  const result = await paginate<ProductRecord>(
    asPaginateDelegate(prisma.product),
    { where, orderBy: buildOrderBy(query), select: productSelect },
    query.page,
    query.limit,
  )
  return { data: result.data.map(toDto), meta: result.meta }
}

export async function findProductById(
  id: string,
  organizationId: string,
): Promise<ProductDto | null> {
  const product = await prisma.product.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: productSelect,
  })
  return product ? toDto(product) : null
}

export async function createProduct(
  organizationId: string,
  data: CreateProductDto,
): Promise<ProductDto> {
  try {
    const product = await prisma.product.create({
      data: {
        organizationId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description ?? null,
        sku: data.sku,
        price: data.price,
        isActive: data.isActive ?? true,
      },
      select: productSelect,
    })
    return toDto(product)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('sku')
    }
    throw error
  }
}

export async function updateProduct(
  id: string,
  organizationId: string,
  data: UpdateProductDto,
): Promise<ProductDto> {
  try {
    const product = await prisma.product.update({
      where: { id, organizationId, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
      select: productSelect,
    })
    return toDto(product)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('sku')
      if (error.code === 'P2025') throw notFound('Product')
    }
    throw error
  }
}

export async function softDeleteProduct(id: string, organizationId: string): Promise<void> {
  const result = await prisma.product.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('Product')
  }
}

export async function exportProducts(organizationId: string): Promise<ProductDto[]> {
  const products = await prisma.product.findMany({
    where: { organizationId, deletedAt: null },
    select: productSelect,
    orderBy: { sku: 'asc' },
  })
  return products.map(toDto)
}

export async function categoryExists(categoryId: string, organizationId: string): Promise<boolean> {
  const count = await prisma.category.count({
    where: { id: categoryId, organizationId, deletedAt: null },
  })
  return count > 0
}
