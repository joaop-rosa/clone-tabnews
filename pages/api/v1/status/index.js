import database from "infra/database.js"
import { InternalServerError } from "infra/errors"

export default async function status(req, res) {
  try {
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
          pg_max_connections: parseInt(
            pgMaxConnections.rows[0].max_connections,
          ),
          pg_used_connections: parseInt(pgUsedConnections.rows[0].count),
        },
      },
      status: "Healthy",
    })
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error })
    res.status(500).json(publicErrorObject)
  }
}
