import { z } from 'zod'

export const createProductSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    sku: z.string().min(1).max(100),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal'),
    categoryId: z.string().cuid(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    sku: z.string().min(1).max(100).optional(),
    price: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional(),
    categoryId: z.string().cuid().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const listProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
  categoryId: z.string().cuid().optional(),
  sortBy: z.enum(['name', 'sku', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ListProductsInput = z.infer<typeof listProductsSchema>
