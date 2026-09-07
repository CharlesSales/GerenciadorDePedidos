import { supabase } from '../config/data/supabaseClient.js'

const camposProduto = `
  id_produto,
  nome,
  descricao,
  preco,
  imagem,
  cozinha,
  estoque,
  restaurante,
  categoria(categoria_nome)
`

export async function listar(restauranteId) {
  let query = supabase
    .from('produtos')
    .select(camposProduto)
    .order('id_produto', { ascending: true })

  if (restauranteId) query = query.eq('restaurante', restauranteId)
  return query
}

export async function listarPorRestaurante(restauranteId) {
  const restaurante = await supabase
    .from('restaurante')
    .select('id_restaurante, nome_restaurante, estado, cidade')
    .eq('id_restaurante', restauranteId)
    .maybeSingle()

  if (restaurante.error || !restaurante.data) return restaurante

  const produtos = await supabase
    .from('produtos')
    .select(camposProduto)
    .eq('restaurante', restauranteId)

  return {
    data: produtos.error
      ? null
      : { restaurante: restaurante.data, produtos: produtos.data },
    error: produtos.error
  }
}

export async function listarPorQrCode(restauranteId) {
  return supabase
    .from('produtos')
    .select(camposProduto)
    .eq('restaurante', restauranteId)
}

export async function buscarPorId(id) {
  return supabase
    .from('produtos')
    .select(camposProduto)
    .eq('id_produto', id)
    .maybeSingle()
}

export async function buscarPorNome(nome, restauranteId) {
  return supabase
    .from('produtos')
    .select('nome')
    .eq('nome', nome)
    .eq('restaurante', restauranteId)
    .maybeSingle()
}

export async function criar(dados) {
  return supabase
    .from('produtos')
    .insert([dados])
    .select()
}

export async function atualizarPorId(id, restauranteId, alteracoes) {
  return supabase
    .from('produtos')
    .update(alteracoes)
    .eq('id_produto', id)
    .eq('restaurante', restauranteId)
    .select()
    .single()
}

export async function deletarPorId(id, restauranteId) {
  return supabase
    .from('produtos')
    .delete()
    .eq('id_produto', id)
    .eq('restaurante', restauranteId)
}

export async function enviarImagem(nome, buffer, contentType) {
  return supabase.storage
    .from('imagens')
    .upload(nome, buffer, { contentType, upsert: false })
}

export function urlImagem(nome) {
  return supabase.storage.from('imagens').getPublicUrl(nome)
}

export async function removerImagem(nome) {
  return supabase.storage.from('imagens').remove([nome])
}