import { errorHandlers, injectAnonymousOrUser } from "infra/controller"
import database from "infra/database.js"
import { createRouter } from "next-connect"
import authorization from "models/authorization.js"

const router = createRouter()

router.use(injectAnonymousOrUser)
router.get(getHandler)

export default router.handler(errorHandlers)

async function getHandler(req, res) {
  const userTryingToGet = req.context.user
  const updatedAt = new Date().toISOString()

  const pgVersion = await database.query("SHOW server_version;")
  const pgMaxConnections = await database.query("SHOW max_connections;")
  const pgUsedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  })

  const statusObject = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersion.rows[0].server_version,
        max_connections: parseInt(pgMaxConnections.rows[0].max_connections),
        opened_connections: parseInt(pgUsedConnections.rows[0].count),
      },
    },
    status: "Healthy",
  }

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    statusObject,
  )

  res.status(200).json(secureOutputValues)
}
