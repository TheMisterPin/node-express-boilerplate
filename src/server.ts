import type { Server } from 'node:http'

import { app } from './app'
import { env } from './config/env'
import { connectToDatabase, disconnectFromDatabase } from './lib/prisma'
import { usersRouter } from './routers/users-router'

let server: Server | undefined

const start = async () => 
{
	await connectToDatabase()

	app.use('/users', usersRouter)

	server = app.listen(env.port, () => 
{
		console.log(`API listening on http://localhost:${env.port}`)
	})
}

start().catch((error) => 
{
	console.error('Failed to start API', error)
	process.exit(1)
})

const shutdown = async () => 
{
	if (!server) 
{
		await disconnectFromDatabase()
		process.exit(0)
	}

	server.close(async () => 
{
		await disconnectFromDatabase()
		process.exit(0)
	})
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
