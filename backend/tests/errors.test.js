import test from 'node:test'
import assert from 'node:assert/strict'
import { AppError, sendError } from '../errors/AppError.js'

test('formata erro da aplicacao', () => {
  let statusCode
  let payload
  const response = {
    status(code) {
      statusCode = code
      return this
    },
    json(value) {
      payload = value
    }
  }

  sendError(response, new AppError('Recurso não encontrado', 404, 'RESOURCE_NOT_FOUND'))

  assert.equal(statusCode, 404)
  assert.deepEqual(payload, {
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Recurso não encontrado'
    }
  })
})
