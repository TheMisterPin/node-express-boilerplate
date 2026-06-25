import type { Server } from 'node:http'

import { createApp } from '@/app'
import { env } from '@/config/env'
import { logger } from '@/shared/lib/logger'
import { disconnectPrisma } from '@/shared/lib/prisma'

const app = createApp()

let server: Server | undefined

const start = (): void => 
{
  server = app.listen(env.PORT, () => 
{
    logger.info(
      { port: env.PORT, nodeEnv: env.NODE_ENV },
      `API listening on http://localhost:${env.PORT}`,
    )
  })
}

start()

const shutdown = async (signal: string): Promise<void> => 
{
  logger.info({ signal }, 'Shutting down gracefully')

  const closeServer = (): Promise<void> =>
    new Promise((resolve, reject) => 
{
      if (!server) 
{
        resolve()

        return
      }
      server.close((err) => 
{
        if (err) reject(err)
        else resolve()
      })
    })

  try 
{
    await closeServer()
    await disconnectPrisma()
    logger.info('Shutdown complete')
    process.exit(0)
  }
 catch (error) 
{
    logger.error({ error }, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
