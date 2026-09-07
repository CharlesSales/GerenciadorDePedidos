import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'

process.env.NODE_ENV = 'test'
const { app } = await import('../server.js')

test('GET /pedidos exige autenticacao', async () => {
  const response = await request(app).get('/pedidos')

  assert.equal(response.status, 401)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'TOKEN_REQUIRED')
})

test('POST /auth/funcionario rejeita body invalido', async () => {
  const response = await request(app)
    .post('/auth/funcionario')
    .send({ usuario: '' })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'VALIDATION_ERROR')
})

test('POST /auth/restaurante rejeita body invalido', async () => {
  const response = await request(app)
    .post('/auth/restaurante')
    .send({ senha: '123456' })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'VALIDATION_ERROR')
})

test('rota inexistente retorna erro JSON padronizado', async () => {
  const response = await request(app).get('/rota-que-nao-existe')

  assert.equal(response.status, 404)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND')
})
