import test from 'node:test'
import assert from 'node:assert/strict'
import { validate } from '../middleware/validate.js'
import { idFuncionarioSchema } from '../validators/funcionarioValidator.js'
import { criarProdutoSchema } from '../validators/produtoValidator.js'

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

test('valida body e substitui valores convertidos', () => {
  const request = {
    body: {
      nome: 'Produto',
      descricao: 'Descricao',
      preco: '10.50',
      estoque: '2',
      categoria: '1'
    }
  }
  const response = responseMock()
  let nextCalled = false

  validate(criarProdutoSchema)(request, response, () => { nextCalled = true })

  assert.equal(nextCalled, true)
  assert.equal(request.body.preco, 10.5)
  assert.equal(request.body.estoque, 2)
  assert.equal(response.statusCode, null)
})

test('valida params e converte o ID', () => {
  const request = { params: { id: '12' } }
  const response = responseMock()
  let nextCalled = false

  validate(idFuncionarioSchema, 'params')(
    request,
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, true)
  assert.equal(request.params.id, 12)
})

test('rejeita body inválido antes do controller', () => {
  const request = { body: { nome: '' } }
  const response = responseMock()
  let nextCalled = false

  validate(criarProdutoSchema)(
    request,
    response,
    () => { nextCalled = true }
  )

  assert.equal(nextCalled, false)
  assert.equal(response.statusCode, 400)
  assert.equal(response.payload.error.code, 'VALIDATION_ERROR')
})
