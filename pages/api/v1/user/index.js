import { createRouter } from "next-connect"
import {
  canRequest,
  errorHandlers,
  injectAnonymousOrUser,
  setSessionCookie,
} from "infra/controller"
import user from "models/user"
import session from "models/session"
import authorization from "models/authorization.js"

const router = createRouter()

router.use(injectAnonymousOrUser)
router.get(canRequest("read:session"), getHandler)

export default router.handler(errorHandlers)

async function getHandler(req, res) {
  const userTryingToGet = req.context.user
  const sessionToken = req.cookies.session_id

  const sessionObject = await session.getOneValidByToken(sessionToken)
  const renewedSessionObject = await session.renew(sessionObject.id)
  setSessionCookie(renewedSessionObject.token, res)

  const userFound = await user.findOneById(sessionObject.user_id)

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  )

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user:self",
    userFound,
  )

  return res.status(200).json(secureOutputValues)
}
