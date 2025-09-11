import { supabase } from "../supabaseClient.js"

// Rota para listar produtos
export async function listarFuncionarios(req, res) {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .order('nome', { ascending: true });  

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function cadastrarFuncionario(req, res) {
  const { id, nome } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ id, nome }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'funcionario cadastrado com sucesso!', produto: data[0] });
};
