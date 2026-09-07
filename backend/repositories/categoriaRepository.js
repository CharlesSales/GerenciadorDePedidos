import { supabase } from '../config/data/supabaseClient.js'

export function listar() {
  return supabase
    .from('categoria')
    .select('id, categoria_nome')
    .order('id', { ascending: true })
}