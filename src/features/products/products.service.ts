import * as productsQueries from './products.queries'
import type { ListProductsInput } from './products.schema'
import type { CreateProductDto, ProductDto, UpdateProductDto } from './products.types'
import { notFound } from '@/shared/constants/errors'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

export async function listProducts(
  query: ListProductsInput,
  actor: ITokenUser,
): Promise<PaginatedResult<ProductDto>> {
  return productsQueries.listProducts(actor.organizationId, query)
}

export async function getProductById(id: string, actor: ITokenUser): Promise<ProductDto> {
  const product = await productsQueries.findProductById(id, actor.organizationId)
  if (!product) {
    throw notFound('Product')
  }
  return product
}

export async function createProduct(
  dto: CreateProductDto,
  actor: ITokenUser,
): Promise<ProductDto> {
  const exists = await productsQueries.categoryExists(dto.categoryId, actor.organizationId)
  if (!exists) {
    throw notFound('Category')
  }
  return productsQueries.createProduct(actor.organizationId, dto)
}

export async function updateProduct(
  id: string,
  dto: UpdateProductDto,
  actor: ITokenUser,
): Promise<ProductDto> {
  if (dto.categoryId) {
    const exists = await productsQueries.categoryExists(dto.categoryId, actor.organizationId)
    if (!exists) {
      throw notFound('Category')
    }
  }
  return productsQueries.updateProduct(id, actor.organizationId, dto)
}

export async function removeProduct(id: string, actor: ITokenUser): Promise<void> {
  await productsQueries.softDeleteProduct(id, actor.organizationId)
}

export function productsToCsv(products: ProductDto[]): string {
  const header = 'id,name,sku,price,category,isActive,createdAt'
  const rows = products.map((p) =>
    [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.price,
      `"${p.categoryName.replace(/"/g, '""')}"`,
      p.isActive,
      p.createdAt.toISOString(),
    ].join(','),
  )
  return [header, ...rows].join('\n')
}

export async function exportProducts(actor: ITokenUser): Promise<string> {
  const products = await productsQueries.exportProducts(actor.organizationId)
  return productsToCsv(products)
}
