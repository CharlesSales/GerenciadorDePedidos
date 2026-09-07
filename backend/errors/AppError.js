export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export function sendError(res, error) {
  const statusCode = error.statusCode || 500
  const payload = {
    success: false,
    error: {
      code: error.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: error.statusCode ? error.message : 'Erro interno do servidor'
    }
  }

  if (error.details) payload.error.details = error.details
  return res.status(statusCode).json(payload)
}