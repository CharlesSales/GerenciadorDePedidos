import { supabase } from "../supabaseClient.js"



// Rota para listar produtos
export async function listarProdutos(req, res) {
  try {
    const { descricao, nome, cozinha } = req.query;

    const getImagemUrl = (nomeArquivo) => {
    const { data } = supabase
      .storage
      .from('imagens')       // nome do bucket
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;    // retorna a URL pública
  };
  
    let query = supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (descricao) query = query.ilike('descricao', `%${descricao}%`);
    if (nome) query = query.ilike('nome', `%${nome}%`);
    if (cozinha) query = query.ilike('cozinha', `%${cozinha}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Adiciona a URL da imagem
    const produtosComImagem = data.map(produto => ({
      ...produto,
      imagem_url: produto.imagem ? getImagemUrl(produto.imagem) : null
    }));

    res.json(produtosComImagem);
  } catch (err) {
  console.error("Erro completo:", err)
  res.status(500).json({ error: err.message || 'Erro inesperado' })
}
};




// Rota para cadastrar produtos
export async function cadastrarProdutos(req, res) {
  // função para obter a URL pública da imagem
  const { nome, preco, categoria } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, preco, categoria }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Produto cadastrado com sucesso!', produto: data[0] });
};





export async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { pag } = req.body;
  await pool.query("UPDATE pedidos SET pag = $1 WHERE id_pedido = $2", [pag, id]);
  res.json({ message: "Status atualizado!" });
}
