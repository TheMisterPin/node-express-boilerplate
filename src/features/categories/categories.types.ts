export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  organizationId: string
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryDto {
  name?: string
  slug?: string
  description?: string
}
