import { sendError } from '../errors/AppError.js'

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  return sendError(res, error)
}