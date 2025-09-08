// backend/server.js
import express from 'express';
import cors from 'cors';
import { supabase } from './supabaseClient.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rota para listar pedidos do almoço/petisco
app.get('/pedidos', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('data_hora', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// Rota para salvar pedidos do almoço/petisco
app.post('/pedidos', async (req, res) => {
  const { cliente, funcionario, casa, itens, total } = req.body;
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario: funcionario, // troque se no banco for "funcionario"
      casa,
      total
    }])
    .select(); // força retorno do registro inserido
  
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(500).json({ error: "Falha ao inserir pedido" });
  }

  res.json({ message: 'Pedido de almoço/petisco salvo!', pedido: data[0] });
});



// Rota para listar pedidos do acarajé
app.get('/pedidosAcaraje', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos_acaraje')
    .select('*')
    .order('data_hora', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});



// Rota para salvar pedidos do acarajé
app.post('/pedidos_acaraje', async (req, res) => {
  const { cliente, funcionario, casa, itens, total } = req.body;
  const { data, error } = await supabase
    .from('pedidos_acaraje')
    .insert([{
      pedidos: JSON.stringify(itens),
      nome_cliente: cliente,
      funcionario: funcionario, // ajuste conforme sua tabela
      casa,
      total
    }])
    .select(); // idem aqui

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(500).json({ error: "Falha ao inserir pedido de acarajé" });
  }

  res.json({ message: 'Pedido de acarajé salvo!', pedido: data[0] });
});


// Rota para cadastrar produtos
app.post('/produtos', async (req, res) => {
  const { nome, preco, categoria } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, preco, categoria }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Produto cadastrado com sucesso!', produto: data[0] });
});


// função para obter a URL pública da imagem
const getImagemUrl = (nomeArquivo) => {
  const { data } = supabase
    .storage
    .from('imagens')       // nome do bucket
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;    // retorna a URL pública
};


// Rota para listar produtos
app.get('/produtos', async (req, res) => {
  try {
    const { descricao, nome, cozinha } = req.query;

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
    res.status(500).json({ error: 'Erro inesperado' });
  }
});

// Rota para listar produtos do acaraje
app.get('/acaraje', async (req, res) => {
  const { data, error } = await supabase
      .from('acaraje_cardapio')
      .select('*')
      .order('nome', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

// Rota para listar funcionários
app.get('/funcionario', async (req, res) => {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .order('nome', { ascending: true });  

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


const PORT = process.env.PORT || 3001; 
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));