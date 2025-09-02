// backend/server.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3001;

// Conexão com PostgreSQL
const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',
  database: 'GerenciadorDePedidos',    
  password: 'rick2003' ,    
  port: 5432,
});

// Middleware
app.use(cors()); // permite requisições do frontend
app.use(express.json()); // parse do JSON


// Rota para Listar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos ORDER BY data_hora');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Rota para salvar pedidos
app.post('/pedidos', async (req, res) => {
  try {
    const { cliente, funcionario, casa, itens, total } = req.body;
    const pedidosStr = JSON.stringify(itens); // transforma itens em string JSON

    const result = await pool.query(
      `INSERT INTO pedidos (pedidos, nome_cliente, nome_funcionario, casa,  total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pedidosStr, cliente, funcionario, casa, total]
    );

    console.log('Pedido salvo no banco:', result.rows[0]);
    res.json({ message: 'Pedido salvo com sucesso!', pedido: result.rows[0] });
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    res.status(500).json({ error: 'Erro ao salvar pedido' });
  }
});

// Cadastrar produto
app.post('/produtos', async (req, res) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const result = await pool.query(
      `INSERT INTO produtos (nome, descricao, preco, estoque)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, descricao, preco, estoque]
    );
    res.json({ message: 'Produto cadastrado com sucesso!', produto: result.rows[0] });
  } catch (err) {
    console.error('Erro ao cadastrar produto:', err);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

// Listar produtos
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Listar funcionários
app.get('/funcionario', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionario ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar funcionários:', err);
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
});

// Rodar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
