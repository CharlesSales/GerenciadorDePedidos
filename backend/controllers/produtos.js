import * as produtoService from '../services/produtoService.js'
import { sendError } from '../errors/AppError.js'

export async function listarProdutos(req, res) {
  try {
    const produtos = await produtoService.listar(req.user?.restauranteId)
    return res.json(produtos)
  } catch (error) {
    return sendError(res, error)
  }
}

export async function listarProdutosPorQRcode(req, res) {
  try {
    const data = await produtoService.listarQrCode(
      req.params.id_restaurante,
      req.params.id_mesa
    )
    return res.status(201).json({ msg: 'Foi', data })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function listarProdutosPorRestaurante(req, res) {
  try {
    const resultado = await produtoService.listarPorRestaurante(req.params.restauranteId)
    return res.json(resultado)
  } catch (error) {
    return sendError(res, error)
  }
}

export async function buscarProdutoPorId(req, res) {
  try {
    const produto = await produtoService.buscarPorId(req.params.id)
    return res.json(produto)
  } catch (error) {
    return sendError(res, error)
  }
}

export async function cadastrarProdutos(req, res) {
  try {
    const resultado = await produtoService.criar({
      dados: req.body,
      arquivo: req.file,
      restauranteId: req.user.restauranteId
    })

    return res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso!',
      produto: resultado.produto,
      temImagem: resultado.temImagem
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function editarprodutos(req, res) {
  try {
    const produtos = await produtoService.atualizar({
      id: req.params.id,
      alteracoes: req.body,
      restauranteId: req.user.restauranteId
    })

    return res.json({
      message: 'Produto atualizado com sucesso!',
      produto: produtos
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export async function deletarProduto(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10)
    await produtoService.remover(id, req.user.restauranteId)

    return res.json({
      success: true,
      message: 'Produto deletado com sucesso!',
      id
    })
  } catch (error) {
    return responderErro(res, error)
  }
}
