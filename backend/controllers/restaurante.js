import * as restauranteService from '../services/restauranteService.js'
import * as cargoService from '../services/cargoService.js'
import { sendError } from '../errors/AppError.js'

export async function listarCargo(req, res) {
  try {
    return res.json(await cargoService.listar())
  } catch (error) {
    return sendError(res, error)
  }
}

export async function listarRestaurantes(req, res) {
  try {
    return res.json(await restauranteService.listar())
  } catch (error) {
    return sendError(res, error)
  }
}

export async function criarRestaurante(req, res) {
  try {
    await restauranteService.criar(req.body)
    return res.json({ message: 'Restaurante cadastrado com sucesso' })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function adicionarCouvert(req, res) {
  try {
    await restauranteService.atualizarCouvert(
      req.user.restauranteId,
      req.body.status
    )
    return res.json({ msg: 'Atualizado com sucesso' })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function statusCouvert(req, res) {
  try {
    return res.json(await restauranteService.buscarCouvert(req.params.id))
  } catch (error) {
    return sendError(res, error)
  }
}
