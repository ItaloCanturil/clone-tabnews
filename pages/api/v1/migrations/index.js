import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

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

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const liveRun = request.method === "POST" ? true : false;
    const options = getMigrationOption(dbClient, liveRun);
    const migrations = await migrationRunner(options);
    const status = liveRun && migrations.length > 0 ? 201 : 200;

    return response.status(status).json(migrations);
  } catch (error) {
    console.error("🚀 ~ migrations ~ error:", error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
