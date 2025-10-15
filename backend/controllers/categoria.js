import { supabase } from "../supabaseClient.js"

// ✅ LISTAR PRODUTOS (COM FILTRO POR RESTAURANTE SE AUTENTICADO)
export async function listarCategorias(req, res) {
  const { data, error } = await supabase
    .from("categoria")
    .select("*")
    .order("id", { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
