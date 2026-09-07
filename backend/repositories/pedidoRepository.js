import { supabase } from '../config/data/supabaseClient.js'

const camposLista = `
  id_pedido,
  data_pedido,
  status,
  observacoes,
  mesa,
  total,
  restaurante,
  cliente:cliente(nome, telefone),
  funcionario:funcionario(nome),
  pedido_produtos(
    quantidade,
    preco_unitario,
    produto:produtos(nome, descricao)
  )
`

const camposDetalhe = `
  *,
  cliente:cliente(nome, telefone, cpf),
  funcionario:funcionario(nome),
  pedido_produtos(
    quantidade,
    preco_unitario,
    produto:produtos(nome, descricao, preco)
  )
`

export async function listarPorRestaurante(restauranteId) {
  return supabase
    .from('pedidos')
    .select(camposLista)
    .eq('restaurante', restauranteId)
    .order('data_pedido', { ascending: false })
}

export async function buscarPorId(id, restauranteId) {
  return supabase
    .from('pedidos')
    .select(camposDetalhe)
    .eq('id_pedido', id)
    .eq('restaurante', restauranteId)
    .maybeSingle()
}

export async function criar(dados) {
  return supabase
    .from('pedidos')
    .insert([dados])
    .select()
    .single()
}

export async function atualizarStatus(id, restauranteId, status) {
  return supabase
    .from('pedidos')
    .update({ status })
    .eq('id_pedido', id)
    .eq('restaurante', restauranteId)
    .select()
    .maybeSingle()
}

export async function listarParaRelatorio(restauranteId, dataInicio, dataFim) {
  let query = supabase
    .from('pedidos')
    .select(`
      id_pedido,
      data_pedido,
      status,
      total,
      mesa,
      cliente:cliente(nome)
    `)
    .eq('restaurante', restauranteId)
    .order('data_pedido', { ascending: false })

  if (dataInicio) query = query.gte('data_pedido', dataInicio)
  if (dataFim) query = query.lte('data_pedido', dataFim)

  return query
}

export function buscarProdutosDoRestaurante(ids, restauranteId) {
  return supabase
    .from('produtos')
    .select('id_produto, restaurante')
    .in('id_produto', ids)
    .eq('restaurante', restauranteId)
}