import migrationRunner from "node-pg-migrate"
import { resolve } from "node:path"
import database from "infra/database"
import { createRouter } from "next-connect"
import { onErrorHandler, onNoMatchHandler } from "infra/controller"

const router = createRouter()

router.get(getHandler)
router.post(postHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
}

async function getHandler(req, res) {
  let dbClient

  try {
    dbClient = await database.getNewClient()
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      databaseUrl: dbClient,
    })

    return res.status(200).json(pendingMigrations)
  } finally {
    await dbClient.end()
  }
}

async function postHandler(req, res) {
  let dbClient

  try {
    dbClient = await database.getNewClient()
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      databaseUrl: dbClient,
    })

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations)
    }

    return res.status(200).json(migratedMigrations)
  } finally {
    await dbClient.end()
  }
}
