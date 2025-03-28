import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import database from "infra/database.js"
import { createRouter } from "next-connect"

const router = createRouter()

router.get(getHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function getHandler(req, res) {
  const updatedAt = new Date().toISOString()

  const pgVersion = await database.query("SHOW server_version;")
  const pgMaxConnections = await database.query("SHOW max_connections;")
  const pgUsedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  })

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        pg_version: pgVersion.rows[0].server_version,
        pg_max_connections: parseInt(pgMaxConnections.rows[0].max_connections),
        pg_used_connections: parseInt(pgUsedConnections.rows[0].count),
      },
    },
    status: "Healthy",
  })
}
