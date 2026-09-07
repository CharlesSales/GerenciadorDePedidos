import * as categoriaService from '../services/categoriaService.js'
import { sendError } from '../errors/AppError.js'

export async function listarCategorias(req, res) {
  try {
    return res.json(await categoriaService.listar())
  } catch (error) {
    return sendError(res, error)
  }
}
