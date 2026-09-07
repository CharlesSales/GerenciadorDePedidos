import * as authService from '../services/authService.js'
import { sendError } from '../errors/AppError.js'

export async function loginFuncionario(req, res) {
  try {
    const { token, user } = await authService.loginFuncionario(
      req.body.usuario,
      req.body.senha
    )

    return res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function loginRestaurante(req, res) {
  try {
    const { token, user } = await authService.loginRestaurante(
      req.body.usuario,
      req.body.senha
    )

    return res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user
    })
  } catch (error) {
    return sendError(res, error)
  }
}
