import jwt from 'jsonwebtoken'
import { supabase } from '../config/data/supabaseClient.js'
import { AppError, sendError } from '../errors/AppError.js'
import { env } from '../config/env.js'

const autenticar = async (req, res, next, opcional = false) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    if (opcional) return next()
    return sendError(res, new AppError('Token de acesso requerido', 401, 'TOKEN_REQUIRED'))
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded.id) {
      return sendError(res, new AppError('Token inválido', 401, 'TOKEN_INVALID'))
    }

    if (!['funcionario', 'restaurante'].includes(decoded.tipo)) {
      return sendError(res, new AppError('Tipo de usuário inválido', 401, 'TOKEN_INVALID'))
    }

    const tabela = decoded.tipo === 'funcionario' ? 'funcionario' : 'restaurante';
    const campoId = decoded.tipo === 'funcionario' ? 'id_funcionario' : 'id_restaurante';
    const campos = decoded.tipo === 'funcionario'
      ? 'id_funcionario, nome, usuario, cargo, restaurante'
      : 'id_restaurante, nome_restaurante, usuario'
    
    const { data: usuario, error } = await supabase
      .from(tabela)
      .select(campos)
      .eq(campoId, decoded.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar usuário:', error.message);
      return sendError(res, new AppError('Erro ao verificar usuário', 500, 'AUTH_USER_LOOKUP_ERROR'))
    }

    if (!usuario) {
      return sendError(res, new AppError('Usuário não encontrado', 401, 'USER_NOT_FOUND'))
    }

    req.user = {
      id: decoded.id,
      tipo: decoded.tipo,
      isAdmin: decoded.tipo === 'restaurante' || decoded.isAdmin === true,
      restauranteId: decoded.tipo === 'funcionario'
        ? usuario.restaurante
        : usuario.id_restaurante,
      dados: usuario
    }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, new AppError('Token expirado', 401, 'TOKEN_EXPIRED'))
    } else if (err.name === 'JsonWebTokenError') {
      return sendError(res, new AppError('Token malformado', 401, 'TOKEN_INVALID'))
    } else {
      return sendError(res, new AppError('Token inválido ou expirado', 401, 'TOKEN_INVALID'))
    }
  }
}

export const authenticateToken = (req, res, next) => autenticar(req, res, next)

export const authenticateTokenOptional = (req, res, next) =>
  autenticar(req, res, next, true)

// Middleware para verificar se é administrador do restaurante
export const requireRestauranteAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return sendError(res, new AppError('Acesso negado. Apenas administradores.', 403, 'FORBIDDEN'))
  }
  next()
}

// Middleware para verificar se é funcionário ou admin
export const requireFuncionarioOrAdmin = (req, res, next) => {
  if (!['funcionario', 'restaurante'].includes(req.user?.tipo)) {
    return sendError(res, new AppError('Acesso negado.', 403, 'FORBIDDEN'))
  }
  next()
}