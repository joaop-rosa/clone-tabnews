import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "infra/errors"

export function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError()
  res.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export function onErrorHandler(error, req, res) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return res.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  })
  res.status(error.statusCode).json(publicErrorObject)
}
