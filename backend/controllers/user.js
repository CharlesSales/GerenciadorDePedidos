import { supabase } from "../supabaseClient.js";

export async function registerToken(req, res) {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "userId e token são obrigatórios" });
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ expo_token: token })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Token salvo com sucesso" });
}
