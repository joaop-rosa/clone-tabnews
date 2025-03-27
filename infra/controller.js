import { InternalServerError, MethodNotAllowedError } from "infra/errors"

export function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError()
  res.status(405).json(publicErrorObject)
}

export function onErrorHandler(error, req, res) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  })
  res.status(500).json(publicErrorObject)
}
