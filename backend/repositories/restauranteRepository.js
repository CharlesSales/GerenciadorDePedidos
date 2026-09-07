import { supabase } from '../config/data/supabaseClient.js'

export function listar() {
  return supabase
    .from('restaurante')
    .select('id_restaurante, nome_restaurante, estado, rua, email, numero_endereco, cidade, taxaCouvert')
    .order('id_restaurante')
}

export function buscarPorUsuario(usuario) {
  return supabase
    .from('restaurante')
    .select('usuario')
    .eq('usuario', usuario)
    .maybeSingle()
}

export function criar(dados) {
  return supabase
    .from('restaurante')
    .insert([dados])
}

export function atualizarCouvert(id, status) {
  return supabase
    .from('restaurante')
    .update({ taxaCouvert: status })
    .eq('id_restaurante', id)
    .select('id_restaurante, taxaCouvert')
    .maybeSingle()
}

export function buscarCouvert(id) {
  return supabase
    .from('restaurante')
    .select('taxaCouvert')
    .eq('id_restaurante', id)
}