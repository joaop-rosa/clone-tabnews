import {
  clearSessionCookie,
  onErrorHandler,
  onNoMatchHandler,
  setSessionCookie,
} from "infra/controller"
import { createRouter } from "next-connect"
import authentication from "models/authentication"
import session from "models/session"

const router = createRouter()

router.post(postHandler)
router.delete(deleteHandler)

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

async function deleteHandler(req, res) {
  const sessionToken = req.cookies.session_id

  const sessionObject = await session.getOneValidByToken(sessionToken)
  const expiredSession = await session.expireById(sessionObject.id)

  clearSessionCookie(res)
  return res.status(200).json(expiredSession)
}
