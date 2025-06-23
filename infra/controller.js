import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors"

export function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError()
  res.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export function onErrorHandler(error, req, res) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  })

  res.status(error.statusCode).json(publicErrorObject)
}
