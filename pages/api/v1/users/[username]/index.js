import { createRouter } from "next-connect"
import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import user from "models/user"

const router = createRouter()

router.get(getHandler).patch(patchHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function getHandler(req, res) {
  const { username } = req.query

  const userFound = await user.findOneByUsername(username)

  return res.status(200).json(userFound)
}

async function patchHandler(req, res) {
  const { username } = req.query
  const userInputValues = req.body

  const updatedUser = await user.update(username, userInputValues)

  return res.status(200).json(updatedUser)
}
