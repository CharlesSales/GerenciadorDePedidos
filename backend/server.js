// backend/server.js
import express from 'express';
import cors from 'cors';
import { supabase } from './supabaseClient.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/pedidos', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('data_hora', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Rota para salvar pedidos
app.post('/pedidos', async (req, res) => {
  console.log("Recebido no backend:", req.body); // <-- isso mostra no console do Node.js
  const { cliente, funcionario, casa, itens, total } = req.body;

  if (!cliente || !funcionario || !itens || itens.length === 0) {
    console.log("Dados inválidos:", req.body);
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .insert([{ pedidos: JSON.stringify(itens), nome_cliente: cliente, funcionario: funcionario, casa, total }]);

  if (error) {
    console.error("Erro ao salvar pedido no Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("Pedido salvo com sucesso:", data);
  res.json({ message: 'Pedido salvo com sucesso!', pedido: data ? data[0] : null });
});



// Cadastrar produto
app.post('/produtos', async (req, res) => {
  const { nome, preco, categoria } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, preco, categoria }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Produto cadastrado com sucesso!', produto: data[0] });
});

app.get('/produtos', async (req, res) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Listar funcionários
app.get('/funcionario', async (req, res) => {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .order('nome', { ascending: true });  

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
