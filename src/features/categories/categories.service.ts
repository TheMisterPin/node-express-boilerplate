import * as categoriesQueries from './categories.queries'
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './categories.types'
import { forbidden, notFound } from '@/shared/constants/errors'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

export async function listCategories(
  query: { page: number; limit: number },
  actor: ITokenUser,
): Promise<PaginatedResult<CategoryDto>> {
  return categoriesQueries.listCategories(actor.organizationId, query.page, query.limit)
}

export async function getCategoryById(id: string, actor: ITokenUser): Promise<CategoryDto> {
  const category = await categoriesQueries.findCategoryById(id, actor.organizationId)
  if (!category) {
    throw notFound('Category')
  }
  return category
}

export async function createCategory(
  dto: CreateCategoryDto,
  actor: ITokenUser,
): Promise<CategoryDto> {
  return categoriesQueries.createCategory(actor.organizationId, dto)
}

export async function updateCategory(
  id: string,
  dto: UpdateCategoryDto,
  actor: ITokenUser,
): Promise<CategoryDto> {
  return categoriesQueries.updateCategory(id, actor.organizationId, dto)
}

export async function removeCategory(id: string, actor: ITokenUser): Promise<void> {
  const productCount = await categoriesQueries.countCategoryProducts(id, actor.organizationId)
  if (productCount > 0) {
    throw forbidden('Cannot delete category with existing products')
  }
  await categoriesQueries.softDeleteCategory(id, actor.organizationId)
}
