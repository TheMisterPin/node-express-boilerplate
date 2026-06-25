export interface ProductDto {
  id: string
  name: string
  description: string | null
  sku: string
  price: string
  isActive: boolean
  categoryId: string
  categoryName: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductDto {
  name: string
  description?: string
  sku: string
  price: string
  categoryId: string
  isActive?: boolean
}

export interface UpdateProductDto {
  name?: string
  description?: string
  sku?: string
  price?: string
  categoryId?: string
  isActive?: boolean
}

export interface ListProductsQuery {
  page: number
  limit: number
  search?: string
  categoryId?: string
  sortBy?: 'name' | 'sku' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
