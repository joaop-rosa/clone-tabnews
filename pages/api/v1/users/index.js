import { createRouter } from "next-connect"
import {
  canRequest,
  errorHandlers,
  injectAnonymousOrUser,
} from "infra/controller"
import user from "models/user"
import activation from "models/activation.js"
import authorization from "models/authorization.js"

const router = createRouter()
router.use(injectAnonymousOrUser)
router.post(canRequest("create:user"), postHandler)

router.post(postHandler)

export default router.handler(errorHandlers)

async function postHandler(req, res) {
  const userTryingToPost = req.context.user
  const userInputValues = req.body
  const newUser = await user.create(userInputValues)

  const activationToken = await activation.create(newUser.id)
  await activation.sendEmailToUser(newUser, activationToken)

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  )

  return res.status(201).json(secureOutputValues)
}
