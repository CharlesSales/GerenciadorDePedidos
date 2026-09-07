import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/authRepository.js'
import { AppError } from '../errors/AppError.js'
import { env } from '../config/env.js'

function erro(message, statusCode, code = 'AUTHENTICATION_ERROR') {
  return new AppError(message, statusCode, code)
}

function validarConfiguracao() {
  return env.jwtSecret
}

function gerarToken(payload) {
  return jwt.sign(payload, validarConfiguracao(), {
    expiresIn: env.jwtExpiresIn
  })
}

export async function loginFuncionario(usuario, senha) {
  if (!usuario || !senha) throw erro('Usuário e senha são obrigatórios', 400)

  const { data: funcionario, error: funcionarioError } =
    await authRepository.buscarFuncionarioPorUsuario(usuario)

  if (funcionarioError) throw erro('Usuário ou senha inválidos', 401)
  if (!funcionario || !(await bcrypt.compare(senha, funcionario.senha))) {
    throw erro('Usuário ou senha inválidos', 401)
  }

  const [restauranteResult, cargoResult] = await Promise.all([
    authRepository.buscarRestaurantePorId(funcionario.restaurante),
    funcionario.cargo
      ? authRepository.buscarCargoPorId(funcionario.cargo)
      : Promise.resolve({ data: null, error: null })
  ])

  if (restauranteResult.error) throw erro('Erro ao buscar restaurante', 500)
  if (cargoResult.error) throw erro('Erro ao buscar cargo', 500)

  const cargo = cargoResult.data
  const isAdmin = cargo?.nome_cargo?.toLowerCase().includes('administrador') || cargo?.id === 1
  const restaurante = restauranteResult.data || null

  const user = {
    id: funcionario.id_funcionario,
    tipo: 'funcionario',
    isAdmin,
    dados: {
      id_funcionario: funcionario.id_funcionario,
      nome: funcionario.nome,
      usuario: funcionario.usuario,
      cargo,
      restaurante
    }
  }

  const token = gerarToken({
    id: funcionario.id_funcionario,
    tipo: 'funcionario',
    isAdmin,
    restaurante: funcionario.restaurante,
    restaurante_id: funcionario.restaurante
  })

  return { token, user }
}

export async function loginRestaurante(usuario, senha) {
  if (!usuario || !senha) throw erro('Usuário e senha são obrigatórios', 400)

  const { data: restaurante, error } =
    await authRepository.buscarRestaurantePorUsuario(usuario)

  if (error) throw erro('Usuário ou senha inválidos', 401)
  if (!restaurante || !(await bcrypt.compare(senha, restaurante.senha))) {
    throw erro('Usuário ou senha inválidos', 401)
  }

  const user = {
    id: restaurante.id_restaurante,
    tipo: 'restaurante',
    isAdmin: true,
    dados: {
      id_restaurante: restaurante.id_restaurante,
      nome_restaurante: restaurante.nome_restaurante,
      nome: restaurante.nome_restaurante,
      usuario: restaurante.usuario
    }
  }

  const token = gerarToken({
    id: restaurante.id_restaurante,
    tipo: 'restaurante',
    restaurante: restaurante.id_restaurante
  })

  return { token, user }
}