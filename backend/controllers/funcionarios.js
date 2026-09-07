import * as funcionarioService from '../services/funcionarioService.js'
import { sendError } from '../errors/AppError.js'

export async function listarFuncionarios(req, res) {
  try {
    const funcionarios = await funcionarioService.listar(req.user.restauranteId)
    return res.json(funcionarios)
  } catch (error) {
    return sendError(res, error)
  }
}

export async function buscarFuncionarioPorId(req, res) {
  try {
    const funcionario = await funcionarioService.buscarPorId(
      req.params.id,
      req.user.restauranteId
    )
    return res.json(funcionario)
  } catch (error) {
    return sendError(res, error)
  }
}

export async function criarFuncionario(req, res) {
  try {
    await funcionarioService.criar({
      ...req.body,
      restauranteId: req.user.restauranteId
    })

    return res.json({ message: 'Funcionario cadastrado com sucesso' })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function editarFuncionario(req, res) {
  try {
    const funcionario = await funcionarioService.atualizar({
      id: req.params.id,
      alteracoes: req.body,
      restauranteId: req.user.restauranteId
    })

    return res.json({
      message: 'Funcionário atualizado com sucesso!',
      funcionario
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function deletarFuncionario(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10)
    await funcionarioService.remover(id, req.user.restauranteId)

    return res.json({
      success: true,
      message: 'Funcionario deletado com sucesso!',
      id
    })
  } catch (error) {
    return sendError(res, error)
  }
}

