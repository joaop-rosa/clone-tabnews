export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Um erro interno não espectado aconteceu", { cause })
    this.name = "InternalServerError"
    this.action = "Entre em contato com o suporte"
    this.statusCode = statusCode || 500
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Serviço indisponível no momento", { cause })
    this.name = "ServiceError"
    this.action = "Verifique se o serviço está disponível"
    this.statusCode = 503
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido para esse endpoint")
    this.name = "MethodNotAllowedError"
    this.action =
      "Verifique se o método utilizado foi correto para esse endpoint"
    this.statusCode = 405
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Ocorreu um erro de validação", { cause })
    this.name = "ValidationError"
    this.action =
      action || "Verifique se o método utilizado foi correto para esse endpoint"
    this.statusCode = 400
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Não foi possível encontrar o recurso", { cause })
    this.name = "NotFoundError"
    this.action =
      action || "Verifique se os parâmetros informados foram corretos"
    this.statusCode = 404
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Usuário não autenticado", { cause })
    this.name = "UnauthorizedError"
    this.action = action || "Faça novamente login para continuar"
    this.statusCode = 401
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}
