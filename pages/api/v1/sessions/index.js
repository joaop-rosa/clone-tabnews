import { onErrorHandler, onNoMatchHandler } from "infra/controller"
import { createRouter } from "next-connect"
import * as cookie from "cookie"
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

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
  res.setHeader("Set-Cookie", setCookie)

  return res.status(201).json(newSession)
}
