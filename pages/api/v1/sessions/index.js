import {
  onErrorHandler,
  onNoMatchHandler,
  setSessionCookie,
} from "infra/controller"
import { createRouter } from "next-connect"
import authentication from "models/authentication"
import session from "models/session"

const router = createRouter()

router.post(postHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function postHandler(req, res) {
  const userInputValues = req.body

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  )

  const newSession = await session.create(authenticatedUser.id)

  setSessionCookie(newSession.token, res)

  return res.status(201).json(newSession)
}
