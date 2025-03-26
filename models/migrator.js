import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors";

function getMigrationOption(dbClient, liveRun) {
  return {
    dbClient: dbClient,
    dryRun: !liveRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    log: () => {},
    migrationsTable: "pgmigrations",
  };
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const options = getMigrationOption(dbClient, false);
    const pendingMigrations = await migrationRunner(options);

    return pendingMigrations;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro na listagem de migrations.",
      cause: error,
    });

    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const options = getMigrationOption(dbClient, true);
    const migratedMigrations = await migrationRunner(options);

    return migratedMigrations;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro ao rodar as migrations.",
      cause: error,
    });

    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
