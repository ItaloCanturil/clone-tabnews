import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.erroHandlers);

function getMigrationOption(dbClient, liveRun) {
  return {
    dbClient: dbClient,
    dryRun: !liveRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function getHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const options = getMigrationOption(dbClient, false);
    const migrations = await migrationRunner(options);
    const status = 200;

    return response.status(status).json(migrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const options = getMigrationOption(dbClient, true);
    const migrations = await migrationRunner(options);
    const status = migrations.length > 0 ? 201 : 200;

    return response.status(status).json(migrations);
  } finally {
    await dbClient.end();
  }
}
