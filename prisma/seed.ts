import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const RESOURCES = [
  'users',
  'roles',
  'permissions',
  'products',
  'categories',
  'organizations',
  'audit-logs',
] as const

const ACTIONS = ['create', 'read', 'update', 'delete', 'export'] as const

type Resource = (typeof RESOURCES)[number]
type Action = (typeof ACTIONS)[number]

const ALL_PERMISSIONS: Array<{ resource: Resource; action: Action }> = RESOURCES.flatMap(
  (resource) => ACTIONS.map((action) => ({ resource, action })),
)

const ADMIN_PERMISSIONS: Array<{ resource: Resource; action: Action }> = ALL_PERMISSIONS.filter(
  (p) => {
    if (p.resource === 'permissions' && p.action !== 'read') return false
    if (p.resource === 'organizations' && p.action === 'delete') return false
    return true
  },
)

const MANAGER_PERMISSIONS: Array<{ resource: Resource; action: Action }> = [
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'update' },
  { resource: 'roles', action: 'read' },
  { resource: 'permissions', action: 'read' },
  { resource: 'products', action: 'create' },
  { resource: 'products', action: 'read' },
  { resource: 'products', action: 'update' },
  { resource: 'products', action: 'export' },
  { resource: 'categories', action: 'create' },
  { resource: 'categories', action: 'read' },
  { resource: 'categories', action: 'update' },
  { resource: 'organizations', action: 'read' },
  { resource: 'audit-logs', action: 'read' },
]

const EMPLOYEE_PERMISSIONS: Array<{ resource: Resource; action: Action }> = [
  { resource: 'users', action: 'read' },
  { resource: 'products', action: 'read' },
  { resource: 'categories', action: 'read' },
  { resource: 'organizations', action: 'read' },
]

const VIEWER_PERMISSIONS: Array<{ resource: Resource; action: Action }> = [
  { resource: 'users', action: 'read' },
  { resource: 'roles', action: 'read' },
  { resource: 'permissions', action: 'read' },
  { resource: 'products', action: 'read' },
  { resource: 'categories', action: 'read' },
  { resource: 'organizations', action: 'read' },
  { resource: 'audit-logs', action: 'read' },
]

const ROLE_PERMISSIONS: Record<string, Array<{ resource: Resource; action: Action }>> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  EMPLOYEE: EMPLOYEE_PERMISSIONS,
  VIEWER: VIEWER_PERMISSIONS,
}

const BUILT_IN_ROLES = [
  { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true },
  { name: 'ADMIN', description: 'Organization administrator', isSystem: true },
  { name: 'MANAGER', description: 'Operational manager', isSystem: true },
  { name: 'EMPLOYEE', description: 'Standard employee', isSystem: true },
  { name: 'VIEWER', description: 'Read-only viewer', isSystem: true },
] as const

async function seedPermissions(
  organizationId: string,
  roleId: string,
  roleName: string,
): Promise<void> {
  const permissions = ROLE_PERMISSIONS[roleName] ?? []
  for (const { resource, action } of permissions) {
    await prisma.permission.upsert({
      where: {
        roleId_resource_action: { roleId, resource, action },
      },
      update: { deletedAt: null },
      create: {
        organizationId,
        roleId,
        resource,
        action,
      },
    })
  }
  console.log(`  Permissions seeded for role: ${roleName} (${permissions.length} grants)`)
}

async function main(): Promise<void> {
  console.log('Seeding database...')

  // a) Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: { name: 'Demo Organization', isActive: true, deletedAt: null },
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      isActive: true,
    },
  })
  console.log(`Organization: ${org.name} (${org.id})`)

  // b) Roles
  const roleMap: Record<string, string> = {}
  for (const roleDef of BUILT_IN_ROLES) {
    const role = await prisma.role.upsert({
      where: {
        organizationId_name: { organizationId: org.id, name: roleDef.name },
      },
      update: {
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        deletedAt: null,
      },
      create: {
        organizationId: org.id,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    })
    roleMap[roleDef.name] = role.id
    console.log(`Role: ${role.name} (${role.id})`)
  }

  // c) Permissions
  console.log('Seeding permissions...')
  for (const roleDef of BUILT_IN_ROLES) {
    const roleId = roleMap[roleDef.name]
    if (roleId) {
      await seedPermissions(org.id, roleId, roleDef.name)
    }
  }

  // d) Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@demo.local'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
  const superAdminRoleId = roleMap['SUPER_ADMIN']

  if (!superAdminRoleId) {
    throw new Error('SUPER_ADMIN role not found after seeding')
  }

  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: { organizationId: org.id, email: adminEmail },
    },
    update: {
      passwordHash,
      name: 'Demo Admin',
      roleId: superAdminRoleId,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      organizationId: org.id,
      email: adminEmail,
      passwordHash,
      name: 'Demo Admin',
      roleId: superAdminRoleId,
    },
  })
  console.log(`Admin user: ${adminUser.email} (${adminUser.id})`)

  // e) Sample categories
  const categoryDefs = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and components' },
    { name: 'Office Supplies', slug: 'office-supplies', description: 'Office and stationery items' },
    { name: 'Furniture', slug: 'furniture', description: 'Office and home furniture' },
  ]

  const categoryMap: Record<string, string> = {}
  for (const cat of categoryDefs) {
    const category = await prisma.category.upsert({
      where: {
        organizationId_slug: { organizationId: org.id, slug: cat.slug },
      },
      update: { name: cat.name, description: cat.description, deletedAt: null },
      create: {
        organizationId: org.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    })
    categoryMap[cat.slug] = category.id
    console.log(`Category: ${category.name} (${category.id})`)
  }

  // f) Sample products (5, distributed across categories)
  const productDefs = [
    {
      name: 'Wireless Mouse',
      sku: 'ELEC-001',
      description: 'Ergonomic wireless mouse',
      price: '29.99',
      categorySlug: 'electronics',
    },
    {
      name: 'USB-C Hub',
      sku: 'ELEC-002',
      description: '7-in-1 USB-C hub adapter',
      price: '49.99',
      categorySlug: 'electronics',
    },
    {
      name: 'Ballpoint Pen Set',
      sku: 'OFF-001',
      description: 'Pack of 12 blue ballpoint pens',
      price: '5.99',
      categorySlug: 'office-supplies',
    },
    {
      name: 'A4 Notebook',
      sku: 'OFF-002',
      description: '200-page ruled A4 notebook',
      price: '3.49',
      categorySlug: 'office-supplies',
    },
    {
      name: 'Ergonomic Chair',
      sku: 'FURN-001',
      description: 'Adjustable office chair with lumbar support',
      price: '299.99',
      categorySlug: 'furniture',
    },
  ]

  for (const prod of productDefs) {
    const categoryId = categoryMap[prod.categorySlug]
    if (!categoryId) continue

    const product = await prisma.product.upsert({
      where: {
        organizationId_sku: { organizationId: org.id, sku: prod.sku },
      },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        categoryId,
        isActive: true,
        deletedAt: null,
      },
      create: {
        organizationId: org.id,
        categoryId,
        name: prod.name,
        description: prod.description,
        sku: prod.sku,
        price: prod.price,
        isActive: true,
      },
    })
    console.log(`Product: ${product.name} (${product.sku})`)
  }

  console.log('Seed complete.')
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
