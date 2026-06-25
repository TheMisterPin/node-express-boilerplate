import { logger } from '@/shared/lib/logger'
import { Prisma, PrismaClient } from '@prisma/client'

// WHY: Per-request audit context set by authenticate middleware via setAuditContext.
let currentActorId: string | undefined
let currentOrganizationId: string | undefined

export function setAuditContext(
  actorId: string | undefined,
  organizationId: string | undefined,
): void {
  currentActorId = actorId
  currentOrganizationId = organizationId
}

export function clearAuditContext(): void {
  currentActorId = undefined
  currentOrganizationId = undefined
}

const AUDITED_MODELS = ['User', 'Role', 'Permission', 'Organization', 'Category', 'Product'] as const

type AuditedModel = (typeof AUDITED_MODELS)[number]

function isAuditedModel(model: string): model is AuditedModel {
  return (AUDITED_MODELS as readonly string[]).includes(model)
}

export function createAuditExtension(auditClient: PrismaClient) {
  return Prisma.defineExtension({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const result = await query(args)
          if (isAuditedModel(model) && currentOrganizationId) {
            await writeAuditLog(
              auditClient,
              model,
              'create',
              result as Record<string, unknown>,
              null,
              result as Record<string, unknown>,
            )
          }
          return result
        },
        async update({ model, args, query }) {
          const result = await query(args)
          if (isAuditedModel(model) && currentOrganizationId) {
            await writeAuditLog(
              auditClient,
              model,
              'update',
              result as Record<string, unknown>,
              null,
              result as Record<string, unknown>,
            )
          }
          return result
        },
        async updateMany({ model, args, query }) {
          const result = await query(args)
          if (isAuditedModel(model) && currentOrganizationId) {
            await writeAuditLog(
              auditClient,
              model,
              'updateMany',
              { count: result.count },
              null,
              args.data as Record<string, unknown>,
            )
          }
          return result
        },
      },
    },
  })
}

async function writeAuditLog(
  auditClient: PrismaClient,
  model: string,
  action: string,
  record: Record<string, unknown>,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): Promise<void> {
  const recordId = typeof record['id'] === 'string' ? record['id'] : 'unknown'
  try {
    await auditClient.auditLog.create({
      data: {
        organizationId: currentOrganizationId!,
        model,
        action,
        recordId,
        actorId: currentActorId ?? null,
        before: before ? (before as Prisma.InputJsonValue) : Prisma.JsonNull,
        after: after ? (after as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    })
  } catch (error) {
    logger.error({ error, model, action, recordId }, 'Failed to write audit log')
  }
}
