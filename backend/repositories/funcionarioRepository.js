import { supabase } from '../config/data/supabaseClient.js'

const camposLista = `
  id_funcionario,
  nome,
  usuario,
  cargo,
  restaurante (
    id_restaurante,
    nome_restaurante
  )
`

export async function listarPorRestaurante(restauranteId) {
  return supabase
    .from('funcionario')
    .select(camposLista)
    .eq('restaurante', restauranteId)
    .order('nome', { ascending: true })
}

export async function buscarPorUsuario(usuario) {
  return supabase
    .from('funcionario')
    .select('usuario')
    .eq('usuario', usuario)
    .maybeSingle()
}

export async function criar(dados) {
  return supabase
    .from('funcionario')
    .insert([dados])
}

export async function buscarPorId(id) {
  return supabase
    .from('funcionario')
    .select('id_funcionario, restaurante')
    .eq('id_funcionario', id)
    .maybeSingle()
}

export async function buscarDetalhadoPorId(id, restauranteId) {
  return supabase
    .from('funcionario')
    .select(camposLista)
    .eq('id_funcionario', id)
    .eq('restaurante', restauranteId)
    .maybeSingle()
}

export async function atualizarPorId(id, restauranteId, alteracoes) {
  return supabase
    .from('funcionario')
    .update(alteracoes)
    .eq('id_funcionario', id)
    .eq('restaurante', restauranteId)
    .select()
    .single()
}

export async function deletarPorId(id, restauranteId) {
  return supabase
    .from('funcionario')
    .delete()
    .eq('id_funcionario', id)
    .eq('restaurante', restauranteId)
}

