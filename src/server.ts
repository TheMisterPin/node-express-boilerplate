import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./lib/prisma.js";
import { usersRouter } from "./routers/users-router.js";
import type { Server } from "node:http";

let server: Server | undefined;

const start = async () => {
  await connectToDatabase();

  app.use("/users", usersRouter);

  server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

const shutdown = async () => {
  if (!server) {
    await disconnectFromDatabase();
    process.exit(0);
  }

  server.close(async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
