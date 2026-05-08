import { createRouter } from "next-connect"
import {
  injectAnonymousOrUser,
  canRequest,
  errorHandlers,
} from "infra/controller"
import { listPendingMigrations, runPendingMigrations } from "models/migrator"
import authorization from "models/authorization.js"

const router = createRouter()
router.use(injectAnonymousOrUser)
router.get(canRequest("read:migration"), getHandler)
router.post(canRequest("create:migration"), postHandler)

export default router.handler(errorHandlers)

async function getHandler(req, res) {
  const userTryingToGet = req.context.user
  const pendingMigrations = await listPendingMigrations()
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  )

  return res.status(200).json(secureOutputValues)
}

async function postHandler(req, res) {
  const userTryingToPost = req.context.user
  const migratedMigrations = await runPendingMigrations()

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:migration",
    migratedMigrations,
  )

  if (migratedMigrations.length > 0) {
    return res.status(201).json(secureOutputValues)
  }

  return res.status(200).json(secureOutputValues)
}
