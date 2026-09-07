import bcrypt from 'bcryptjs'
import * as funcionarioRepository from '../repositories/funcionarioRepository.js'
import { AppError } from '../errors/AppError.js'

const camposPermitidos = ['nome', 'usuario', 'cargo']

function erro(message, statusCode, code = 'EMPLOYEE_ERROR') {
  return new AppError(message, statusCode, code)
}

export async function listar(restauranteId) {
  if (!restauranteId) throw erro('Usuário sem restaurante associado', 401)

  const { data, error } = await funcionarioRepository.listarPorRestaurante(restauranteId)
  if (error) throw erro(error.message, 500)

  return data
}

export async function criar({ nome, cargo, usuario, senha, confirmarSenha, restauranteId }) {
  if (!nome) throw erro('O nome é obrigatório!', 422)
  if (!cargo) throw erro('O cargo é obrigatório!', 422)
  if (!restauranteId) throw erro('O restaurante é obrigatório!', 422)
  if (!usuario) throw erro('O usuário é obrigatório!', 422)
  if (!senha) throw erro('A senha é obrigatória!', 422)
  if (senha !== confirmarSenha) throw erro('As senhas não conferem!', 422)

  const { data: userExists, error: checkError } =
    await funcionarioRepository.buscarPorUsuario(usuario)

  if (checkError) throw erro('Erro ao verificar usuário existente', 500)
  if (userExists) throw erro('Já existe um usuário com esse nome!', 422)

  const passwordHash = await bcrypt.hash(senha, 12)
  const { error } = await funcionarioRepository.criar({
    nome,
    cargo,
    restaurante: restauranteId,
    usuario,
    senha: passwordHash
  })

  if (error) throw erro(error.message, 500)
}

export async function atualizar({ id, alteracoes, restauranteId }) {
  const campos = Object.keys(alteracoes || {})
  if (!campos.length || campos.some(campo => !camposPermitidos.includes(campo))) {
    throw erro('Campo inválido para atualização', 400)
  }

  const { data: funcionario, error: buscaError } =
    await funcionarioRepository.buscarPorId(id)

  if (buscaError || !funcionario) throw erro('Funcionário não encontrado', 404)
  if (funcionario.restaurante !== restauranteId) throw erro('Acesso negado', 403)

  const { data, error } = await funcionarioRepository.atualizarPorId(
    id,
    restauranteId,
    Object.fromEntries(campos.map(campo => [campo, alteracoes[campo]]))
  )

  if (error) throw erro('Erro ao atualizar funcionário', 500)

  return data
}

export async function remover(id, restauranteId) {
  const { error } = await funcionarioRepository.deletarPorId(id, restauranteId)
  if (error) throw erro(error.message, 500)
}

export async function buscarPorId(id, restauranteId) {
  const { data, error } = await funcionarioRepository.buscarDetalhadoPorId(id, restauranteId)
  if (error || !data) throw erro('Funcionário não encontrado', 404, 'RESOURCE_NOT_FOUND')
  return data
}