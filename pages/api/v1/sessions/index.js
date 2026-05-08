import {
  canRequest,
  clearSessionCookie,
  errorHandlers,
  injectAnonymousOrUser,
  setSessionCookie,
} from "infra/controller"
import { createRouter } from "next-connect"
import authentication from "models/authentication"
import session from "models/session"
import authorization from "models/authorization.js"

import { ForbiddenError } from "infra/errors.js"

const router = createRouter()

router.use(injectAnonymousOrUser)
router.post(canRequest("create:session"), postHandler)
router.delete(deleteHandler)

export default router.handler(errorHandlers)

async function postHandler(req, res) {
  const userInputValues = req.body

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  )

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login.",
      action: "Contate o suporte caso você acredite que isto seja um erro.",
    })
  }

  const newSession = await session.create(authenticatedUser.id)

  setSessionCookie(newSession.token, res)

  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  )

  return res.status(201).json(secureOutputValues)
}

async function deleteHandler(req, res) {
  const userTryingToDelete = req.context.user
  const sessionToken = req.cookies.session_id

  const sessionObject = await session.getOneValidByToken(sessionToken)
  const expiredSession = await session.expireById(sessionObject.id)

  clearSessionCookie(res)

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    expiredSession,
  )

  return res.status(200).json(secureOutputValues)
}
