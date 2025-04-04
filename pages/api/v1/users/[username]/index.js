import { createRouter } from "next-connect"
import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import user from "models/user"

const router = createRouter()

router.get(getHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function getHandler(req, res) {
  const { username } = req.query

  const userFound = await user.findOneByUsername(username)

  return res.status(200).json(userFound)
}
