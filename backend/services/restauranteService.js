import bcrypt from 'bcryptjs'
import * as restauranteRepository from '../repositories/restauranteRepository.js'
import { AppError } from '../errors/AppError.js'

function erro(message, statusCode, code = 'RESTAURANT_ERROR') {
  return new AppError(message, statusCode, code)
}

export async function listar() {
  const { data, error } = await restauranteRepository.listar()
  if (error) throw erro('Erro ao buscar restaurantes', 500)
  return data
}

export async function criar(dados) {
  const {
    usuario,
    senha,
    nome_restaurante,
    estado,
    rua,
    email,
    numero_endereco,
    cidade,
    confirmarSenha
  } = dados

  if (!usuario || !nome_restaurante || !estado || !rua || !cidade || !numero_endereco || !senha || !email) {
    throw erro('Todos os campos obrigatórios devem ser preenchidos', 422)
  }
  if (senha !== confirmarSenha) throw erro('As senhas não conferem!', 422)

  const { data: existente, error: buscaError } =
    await restauranteRepository.buscarPorUsuario(usuario)
  if (buscaError) throw erro('Erro ao verificar usuário existente', 500)
  if (existente) throw erro('Já existe um usuário com esse nome!', 422)

  const senhaHash = await bcrypt.hash(senha, 12)
  const { error } = await restauranteRepository.criar({
    usuario,
    nome_restaurante,
    estado,
    rua,
    numero_endereco,
    cidade,
    email,
    senha: senhaHash
  })

  if (error) throw erro(error.message, 500)
}

export async function atualizarCouvert(restauranteId, status) {
  if (status === undefined || status === null) throw erro('O status é obrigatório', 400)
  const { error } = await restauranteRepository.atualizarCouvert(restauranteId, status)
  if (error) throw erro('Erro ao atualizar status do couvert', 500)
}

export async function buscarCouvert(id) {
  const { data, error } = await restauranteRepository.buscarCouvert(id)
  if (error) throw erro('Erro ao buscar status do couvert', 500)
  return data
}