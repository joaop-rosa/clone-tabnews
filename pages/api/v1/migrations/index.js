import { createRouter } from "next-connect"
import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import { listPendingMigrations, runPendingMigrations } from "models/migrator"

const router = createRouter()

router.get(getHandler)
router.post(postHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function getHandler(req, res) {
  const pendingMigrations = await listPendingMigrations()
  return res.status(200).json(pendingMigrations)
}

async function postHandler(req, res) {
  const migratedMigrations = await runPendingMigrations()

  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations)
  }

  return res.status(200).json(migratedMigrations)
}
