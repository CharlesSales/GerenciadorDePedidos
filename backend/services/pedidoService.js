import * as pedidoRepository from '../repositories/pedidoRepository.js'
import { AppError } from '../errors/AppError.js'

const statusValidos = ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado']

function erro(message, statusCode, code = 'ORDER_ERROR') {
  return new AppError(message, statusCode, code)
}

export async function listar(restauranteId) {
  const { data, error } = await pedidoRepository.listarPorRestaurante(restauranteId)
  if (error) throw erro('Erro ao buscar pedidos', 500)

  return {
    pedidos: data || [],
    restaurante_id: restauranteId,
    total_pedidos: data?.length || 0
  }
}

export async function buscarPorId(id, restauranteId) {
  const { data, error } = await pedidoRepository.buscarPorId(id, restauranteId)
  if (error || !data) throw erro('Pedido não encontrado', 404)
  return data
}

export async function criar({ cliente, funcionario, casa, itens, obs, total, restauranteId }) {
  if (!cliente || !funcionario || !casa || !restauranteId) {
    throw erro('Campos obrigatórios não informados', 400)
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw erro('Os itens do pedido são obrigatórios', 400)
  }

  const totalNumerico = Number(total)
  if (!Number.isFinite(totalNumerico) || totalNumerico < 0) {
    throw erro('O total do pedido deve ser um número válido', 400)
  }

  const idsProdutos = itens
    .map(item => item?.produto_id ?? item?.id_produto)
    .filter(id => id !== undefined && id !== null)

  if (idsProdutos.length !== itens.length) {
    throw erro('Todos os itens devem informar o produto', 400)
  }

  const { data: produtos, error: produtosError } =
    await pedidoRepository.buscarProdutosDoRestaurante(idsProdutos, restauranteId)

  if (produtosError) throw erro('Erro ao validar produtos do pedido', 500)
  if (!produtos || produtos.length !== new Set(idsProdutos).size) {
    throw erro('O pedido contém produto de outro restaurante ou inexistente', 400)
  }

  const { data, error } = await pedidoRepository.criar({
    cliente,
    funcionario_id: funcionario,
    casa,
    obs,
    total: totalNumerico,
    restaurante: restauranteId,
    itens
  })

  if (error) throw erro(error.message, 500)
  return data
}

export async function atualizarStatus(id, restauranteId, status) {
  if (!statusValidos.includes(status)) throw erro('Status inválido', 400)

  const { data, error } = await pedidoRepository.atualizarStatus(id, restauranteId, status)
  if (error || !data) throw erro('Pedido não encontrado', 404)
  return data
}

export async function gerarRelatorio(restauranteId, dataInicio, dataFim) {
  const { data: pedidos, error } = await pedidoRepository.listarParaRelatorio(
    restauranteId,
    dataInicio,
    dataFim
  )

  if (error) throw erro('Erro ao gerar relatório', 500)

  const totalVendas = (pedidos || []).reduce(
    (total, pedido) => total + Number.parseFloat(pedido.total || 0),
    0
  )
  const pedidosPorStatus = (pedidos || []).reduce((resumo, pedido) => {
    resumo[pedido.status] = (resumo[pedido.status] || 0) + 1
    return resumo
  }, {})

  return {
    restaurante_id: restauranteId,
    periodo: {
      data_inicio: dataInicio || 'Início',
      data_fim: dataFim || 'Hoje'
    },
    resumo: {
      total_pedidos: pedidos?.length || 0,
      total_vendas: totalVendas,
      pedidos_por_status: pedidosPorStatus
    },
    pedidos: pedidos || []
  }
}