import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
} from "infra/errors"
import * as cookie from "cookie"
import session from "models/session"
import user from "models/user.js"
import authorization from "models/authorization.js"

export function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError()
  res.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export function onErrorHandler(error, req, res) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return res.status(error.statusCode).json(error)
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(res)
    return res.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  })

  res.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })

  response.setHeader("Set-Cookie", setCookie)
}

export function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })

  response.setHeader("Set-Cookie", setCookie)
}

export async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request)
    return next()
  }

  injectAnonymousUser(request)
  return next()
}

export async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies.session_id
  const sessionObject = await session.getOneValidByToken(sessionToken)
  const userObject = await user.findOneById(sessionObject.user_id)

  request.context = {
    ...request.context,
    user: userObject,
  }
}

export function injectAnonymousUser(request) {
  const anonymousUserObject = {
    features: ["read:activation_token", "create:session", "create:user"],
  }

  request.context = {
    ...request.context,
    user: anonymousUserObject,
  }
}

export function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user

    if (authorization.can(userTryingToRequest, feature)) {
      return next()
    }

    throw new ForbiddenError({
      message: "Você não possui permissão para executar esta ação.",
      action: `Verifique se o seu usuário possui a feature "${feature}"`,
    })
  }
}

export const errorHandlers = {
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
}
