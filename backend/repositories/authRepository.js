import { supabase } from '../config/data/supabaseClient.js'

export async function buscarFuncionarioPorUsuario(usuario) {
  return supabase
    .from('funcionario')
    .select('id_funcionario, nome, usuario, senha, cargo, restaurante')
    .eq('usuario', usuario)
    .maybeSingle()
}

export async function buscarRestaurantePorId(id) {
  return supabase
    .from('restaurante')
    .select('id_restaurante, nome_restaurante, usuario, estado, rua, email, numero_endereco, cidade')
    .eq('id_restaurante', id)
    .maybeSingle()
}

export async function buscarCargoPorId(id) {
  return supabase
    .from('cargo')
    .select('id, nome_cargo')
    .eq('id', id)
    .maybeSingle()
}

export async function buscarRestaurantePorUsuario(usuario) {
  return supabase
    .from('restaurante')
    .select('id_restaurante, nome_restaurante, usuario, senha')
    .eq('usuario', usuario)
    .maybeSingle()
}