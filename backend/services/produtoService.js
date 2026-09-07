import * as produtoRepository from '../repositories/produtoRepository.js'
import { AppError } from '../errors/AppError.js'
import { env } from '../config/env.js'

const cache = new Map()
const cacheTtl = 5 * 60 * 1000
const camposPermitidos = ['nome', 'descricao', 'preco', 'imagem', 'cozinha', 'estoque', 'categoria']
const tiposImagemPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

function erro(message, statusCode, code = 'PRODUCT_ERROR') {
  return new AppError(message, statusCode, code)
}

function adicionarUrlImagem(produto) {
  const apiUrl = env.apiUrl
  const imagemUrl = produto.imagem?.startsWith('http')
    ? produto.imagem
    : produto.imagem
      ? `${apiUrl}/uploads/${produto.imagem}`
      : null

  return {
    ...produto,
    imagem_url: imagemUrl
  }
}

export async function listar(restauranteId) {
  const cacheKey = restauranteId ? `produtos:${restauranteId}` : 'produtos:todos'
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cacheTtl) return cached.data

  const { data, error } = await produtoRepository.listar(restauranteId)
  if (error) throw erro(error.message, 500)

  const produtos = (data || []).map(adicionarUrlImagem)
  cache.set(cacheKey, { data: produtos, timestamp: Date.now() })
  return produtos
}

export async function listarQrCode(restauranteId, mesaId) {
  if (!restauranteId || !mesaId) throw erro('Os campos são obrigatórios', 400)

  const { data, error } = await produtoRepository.listarPorQrCode(restauranteId)
  if (error) throw erro(error.message, 500)
  return data
}

export async function listarPorRestaurante(restauranteId) {
  const resultado = await produtoRepository.listarPorRestaurante(Number(restauranteId))
  if (resultado.error) throw erro(resultado.error.message, 500)
  if (!resultado.data) throw erro('Restaurante não encontrado', 404)

  const produtos = resultado.data.produtos || []
  return {
    restaurante: {
      id: resultado.data.restaurante.id_restaurante,
      nome: resultado.data.restaurante.nome_restaurante
    },
    produtos,
    total: produtos.length
  }
}

export async function buscarPorId(id) {
  const { data, error } = await produtoRepository.buscarPorId(id)
  if (error || !data) throw erro('Produto não encontrado', 404)
  return adicionarUrlImagem(data)
}

export async function criar({ dados, arquivo, restauranteId }) {
  const { nome, descricao, preco, estoque, cozinha, categoria } = dados
  if (!nome) throw erro('O nome é obrigatório!', 422)
  if (!descricao) throw erro('A descrição é obrigatória!', 422)
  if (preco === undefined || preco === '') throw erro('O preço é obrigatório!', 422)
  if (estoque === undefined || estoque === '') throw erro('O estoque é obrigatório!', 422)
  if (!categoria) throw erro('A categoria é obrigatória!', 422)
  if (!restauranteId) throw erro('O restaurante é obrigatório!', 422)

  const precoNumerico = Number.parseFloat(preco)
  const estoqueNumerico = Number.parseInt(estoque, 10)
  const categoriaNumerica = Number.parseInt(categoria, 10)
  if (!Number.isFinite(precoNumerico) || precoNumerico < 0) {
    throw erro('O preço deve ser um número válido', 422)
  }
  if (!Number.isInteger(estoqueNumerico) || estoqueNumerico < 0) {
    throw erro('O estoque deve ser um número inteiro válido', 422)
  }
  if (!Number.isInteger(categoriaNumerica)) {
    throw erro('A categoria deve ser um número válido', 422)
  }

  const { data: existente, error: buscaError } = await produtoRepository.buscarPorNome(nome, restauranteId)
  if (buscaError) throw erro('Erro ao verificar produto existente', 500)
  if (existente) throw erro('Já existe um produto com esse nome neste restaurante!', 422)

  let imagem = null
  let nomeArquivo = null
  if (arquivo) {
    if (!tiposImagemPermitidos.includes(arquivo.mimetype)) {
      throw erro('Tipo de arquivo inválido. Use apenas: JPEG, PNG, GIF ou WebP', 422)
    }
    if (arquivo.size > 5 * 1024 * 1024) throw erro('Arquivo muito grande. Tamanho máximo: 5MB', 422)

    const extensao = arquivo.originalname.split('.').pop()
    nomeArquivo = `produto-${Date.now()}-${Math.random().toString(36).substring(7)}.${extensao}`
    const upload = await produtoRepository.enviarImagem(nomeArquivo, arquivo.buffer, arquivo.mimetype)
    if (upload.error) throw erro('Erro ao fazer upload da imagem', 500)
    imagem = produtoRepository.urlImagem(nomeArquivo).data.publicUrl
  }

  const { data, error } = await produtoRepository.criar({
    nome,
    descricao,
    preco: precoNumerico,
    estoque: estoqueNumerico,
    cozinha,
    categoria: categoriaNumerica,
    restaurante: Number.parseInt(restauranteId, 10),
    imagem
  })

  if (error || !data?.length) {
    if (nomeArquivo) await produtoRepository.removerImagem(nomeArquivo)
    throw erro(error?.message || 'Erro ao cadastrar produto', 500)
  }

  cache.clear()
  return { produto: data[0], temImagem: Boolean(imagem) }
}

export async function atualizar({ id, alteracoes, restauranteId }) {
  const campos = Object.keys(alteracoes || {})
  if (!campos.length || campos.some(campo => !camposPermitidos.includes(campo))) {
    throw erro('Campo inválido para atualização', 400)
  }

  const atual = await produtoRepository.buscarPorId(id)
  if (atual.error || !atual.data) throw erro('Produto não encontrado', 404)
  if (atual.data.restaurante !== restauranteId) throw erro('Acesso negado', 403)

  const dadosAtualizados = Object.fromEntries(
    campos.map(campo => [campo, alteracoes[campo]])
  )
  const { data, error } = await produtoRepository.atualizarPorId(id, restauranteId, dadosAtualizados)
  if (error) throw erro('Erro ao atualizar produto', 500)
  cache.clear()
  return data
}

export async function remover(id, restauranteId) {
  const { error } = await produtoRepository.deletarPorId(id, restauranteId)
  if (error) throw erro('Erro ao deletar produto', 500)
  cache.clear()
}