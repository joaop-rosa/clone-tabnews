import { createRouter } from "next-connect"
import {
  onErrorHandler,
  onNoMatchHandler,
  setSessionCookie,
} from "infra/controller"
import user from "models/user"
import session from "models/session"

const router = createRouter()

router.get(getHandler)

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
})

async function getHandler(req, res) {
  const sessionToken = req.cookies.session_id

  const sessionObject = await session.getOneValidByToken(sessionToken)
  const renewedSessionObject = await session.renew(sessionObject.id)
  setSessionCookie(renewedSessionObject.token, res)

  const userFound = await user.findOneById(sessionObject.user_id)

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  )
  return res.status(200).json(userFound)
}
