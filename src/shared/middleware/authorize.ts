import { forbidden, unauthorized } from '@/shared/constants/errors'
import type { Action, ResourceKey } from '@/shared/types/common'
import type { RequestHandler } from 'express'
import * as permissionsQueries from '@/features/permissions/permissions.queries'

// WHY: In-process cache avoids DB hit on every authorized request. Invalidated on permission writes.
let permissionCache: Map<string, Set<string>> | null = null

async function loadPermissionCache(): Promise<Map<string, Set<string>>> {
  if (permissionCache) {
    return permissionCache
  }
  permissionCache = await permissionsQueries.buildPermissionCache()
  return permissionCache
}

export function invalidatePermissionCache(): void {
  permissionCache = null
}

function cacheKey(roleId: string, resource: ResourceKey, action: Action): string {
  return `${roleId}:${resource}:${action}`
}

export function authorize(resource: ResourceKey, action: Action): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw unauthorized()
      }

      const cache = await loadPermissionCache()
      const key = cacheKey(req.user.roleId, resource, action)

      if (!cache.has(key)) {
        throw forbidden(`Cannot ${action} ${resource}`)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
