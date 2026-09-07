import * as pedidoService from '../services/pedidoService.js'
import { sendError } from '../errors/AppError.js'

export async function listarPedidos(req, res) {
  try {
    const resultado = await pedidoService.listar(req.user.restauranteId)
    return res.json({ success: true, ...resultado })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function buscarPedidoPorId(req, res) {
  try {
    const pedido = await pedidoService.buscarPorId(
      req.params.id,
      req.user.restauranteId
    )
    return res.json({ success: true, pedido })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function criarPedido(req, res) {
  try {
    const pedido = await pedidoService.criar({
      ...req.body,
      restauranteId: req.user.restauranteId
    })
    return res.json({ message: 'Pedido salvo com sucesso!', pedido })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function atualizarStatusPedido(req, res) {
  try {
    const pedido = await pedidoService.atualizarStatus(
      req.params.id,
      req.user.restauranteId,
      req.body.status
    )
    return res.json({
      success: true,
      message: 'Status atualizado com sucesso!',
      pedido
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function relatorioVendas(req, res) {
  try {
    const relatorio = await pedidoService.gerarRelatorio(
      req.user.restauranteId,
      req.query.data_inicio,
      req.query.data_fim
    )
    return res.json({ success: true, ...relatorio })
  } catch (error) {
    return sendError(res, error)
  }
}
