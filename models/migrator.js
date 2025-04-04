const { default: database } = require("infra/database")
import migrationRunner from "node-pg-migrate"
import { resolve } from "node:path"

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  verbose: false,
  migrationsTable: "pgmigrations",
}

export async function listPendingMigrations() {
  let dbClient

  try {
    dbClient = await database.getNewClient()
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      databaseUrl: dbClient,
    })

    return pendingMigrations
  } finally {
    await dbClient.end()
  }
}

export async function runPendingMigrations() {
  let dbClient

  try {
    dbClient = await database.getNewClient()
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      databaseUrl: dbClient,
    })

    return migratedMigrations
  } finally {
    await dbClient.end()
  }
}
