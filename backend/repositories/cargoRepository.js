import { supabase } from '../config/data/supabaseClient.js'

export function listar() {
  return supabase
    .from('cargo')
    .select('id, nome_cargo')
    .order('id', { ascending: true })
}