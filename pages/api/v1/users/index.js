import { createRouter } from "next-connect"
import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import user from "models/user"

const router = createRouter()

router.post(postHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function postHandler(req, res) {
  const userInputValues = req.body
  const createdUser = await user.create(userInputValues)
  return res.status(201).json(createdUser)
}
