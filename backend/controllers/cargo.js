import * as cargoService from '../services/cargoService.js'
import { sendError } from '../errors/AppError.js'

export async function listarCargo(req, res) {
  try {
    return res.json(await cargoService.listar())
  } catch (error) {
    return sendError(res, error)
  }
}
