import test from 'node:test'
import assert from 'node:assert/strict'
import { criarFuncionarioSchema, atualizarFuncionarioSchema } from '../validators/funcionarioValidator.js'
import { criarProdutoSchema } from '../validators/produtoValidator.js'
import { criarPedidoSchema, atualizarStatusPedidoSchema } from '../validators/pedidoValidator.js'
import { loginSchema } from '../validators/authValidator.js'

 test('valida login com usuario e senha', () => {
  const resultado = loginSchema.safeParse({ usuario: 'henrique', senha: 'senha' })
  assert.equal(resultado.success, true)
})

test('rejeita funcionario sem campos obrigatorios', () => {
  const resultado = criarFuncionarioSchema.safeParse({ nome: 'Apenas nome' })
  assert.equal(resultado.success, false)
})

test('converte campos numericos de funcionario', () => {
  const resultado = criarFuncionarioSchema.safeParse({
    nome: 'Funcionario',
    cargo: '1',
    usuario: 'funcionario',
    senha: '123456',
    confirmarSenha: '123456'
  })

  assert.equal(resultado.success, true)
  assert.equal(resultado.data.cargo, 1)
})

test('rejeita atualizacao de funcionario com campo desconhecido', () => {
  const resultado = atualizarFuncionarioSchema.safeParse({ senha: 'nova-senha' })
  assert.equal(resultado.success, false)
})

test('valida e converte produto', () => {
  const resultado = criarProdutoSchema.safeParse({
    nome: 'Produto',
    descricao: 'Descricao',
    preco: '12.50',
    estoque: '4',
    categoria: '2'
  })

  assert.equal(resultado.success, true)
  assert.equal(resultado.data.preco, 12.5)
  assert.equal(resultado.data.estoque, 4)
})

test('rejeita produto com preco negativo', () => {
  const resultado = criarProdutoSchema.safeParse({
    nome: 'Produto',
    descricao: 'Descricao',
    preco: '-1',
    estoque: '4',
    categoria: '2'
  })

  assert.equal(resultado.success, false)
})

test('valida itens e total do pedido', () => {
  const resultado = criarPedidoSchema.safeParse({
    cliente: 'Cliente',
    funcionario: '1',
    casa: 'Mesa 1',
    itens: [{ id_produto: '2', quantidade: '1' }],
    total: '25.50'
  })

  assert.equal(resultado.success, true)
  assert.equal(resultado.data.total, 25.5)
})

test('limita status do pedido', () => {
  const resultado = atualizarStatusPedidoSchema.safeParse({ status: 'invalido' })
  assert.equal(resultado.success, false)
})
