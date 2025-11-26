import { supabase } from "../supabaseClient.js"

export async function listarOpcoesDeRetirada(req, res) {
  const { data, error } = await supabase
    .from("retirada")
    .select("*")
    .order("id", { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
