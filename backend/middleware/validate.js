import { AppError, sendError } from '../errors/AppError.js'

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      return sendError(res, new AppError(
        'Dados inválidos',
        400,
        'VALIDATION_ERROR',
        result.error.flatten()
      ))
    }

    if (source === 'body') {
      req.body = result.data
    } else {
      Object.keys(req[source]).forEach(key => delete req[source][key])
      Object.assign(req[source], result.data)
    }
    next()
  }
}