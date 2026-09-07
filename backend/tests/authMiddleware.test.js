import test from 'node:test'
import assert from 'node:assert/strict'
import {
  authenticateToken,
  requireRestauranteAdmin,
  requireFuncionarioOrAdmin
} from '../middleware/auth.js'

function responseMock() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    }
  }
}

test('rejeita requisicao sem token', async () => {
  const response = responseMock()
  let nextCalled = false

  await authenticateToken(
    { headers: {} },
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, false)
  assert.equal(response.statusCode, 401)
  assert.equal(response.payload.error.code, 'TOKEN_REQUIRED')
})

test('rejeita token malformado', async () => {
  const response = responseMock()
  let nextCalled = false

  await authenticateToken(
    { headers: { authorization: 'Bearer token-invalido' } },
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, false)
  assert.equal(response.statusCode, 401)
  assert.equal(response.payload.error.code, 'TOKEN_INVALID')
})

test('permite administrador do restaurante', () => {
  const response = responseMock()
  let nextCalled = false

  requireRestauranteAdmin(
    { user: { isAdmin: true } },
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, true)
  assert.equal(response.statusCode, null)
})

test('bloqueia usuario sem permissao de administrador', () => {
  const response = responseMock()

  requireRestauranteAdmin(
    { user: { tipo: 'funcionario', isAdmin: false } },
    response,
    () => {}
  )

  assert.equal(response.statusCode, 403)
  assert.equal(response.payload.error.code, 'FORBIDDEN')
})

test('permite funcionario ou administrador', () => {
  const response = responseMock()
  let nextCalled = false

  requireFuncionarioOrAdmin(
    { user: { tipo: 'funcionario' } },
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, true)
})
