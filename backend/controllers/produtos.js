import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'

// ✅ LISTAR PRODUTOS (COM FILTRO POR RESTAURANTE SE AUTENTICADO)
export async function listarProdutos(req, res) {
  try {
    console.log('📦 Listando produtos...');

    // ✅ VERIFICAR SE TEM TOKEN
    const token = req.headers.authorization?.replace('Bearer ', '');
    let restauranteId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.tipo === 'funcionario') {
          // ✅ FUNCIONÁRIO: BUSCAR RESTAURANTE
          const { data: funcionario } = await supabase
            .from('funcionario')
            .select('restaurante')
            .eq('id_funcionario', decoded.id)
            .single();
          
          restauranteId = funcionario?.restaurante;
        } else if (decoded.tipo === 'restaurante') {
          // ✅ RESTAURANTE: USAR PRÓPRIO ID
          restauranteId = decoded.id;
        }

        console.log('🏪 Filtrar produtos do restaurante:', restauranteId);
      } catch (tokenError) {
        console.log('⚠️ Token inválido, listando todos os produtos');
      }
    } else {
      console.log('📦 Sem token, listando todos os produtos');
    }

    // ✅ BUSCAR PRODUTOS
    let query = supabase
      .from('produtos')
      .select(`
        id_produto,
        nome,
        descricao,
        preco,
        imagem,
        cozinha,
        estoque,
        restaurante,
        categoria(categoria_nome)
      `)
      .order('nome', { ascending: true });

    // ✅ FILTRAR POR RESTAURANTE SE IDENTIFICADO
    if (restauranteId) {
      query = query.eq('restaurante', restauranteId);
    }

    const { data: produtos, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ ${produtos?.length || 0} produtos encontrados para restaurante ${restauranteId || 'todos'}`);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

    // ✅ ADICIONAR URL DA IMAGEM SE NECESSÁRIO
    const produtosComImagem = produtos?.map(produto => ({
      ...produto,
      imagem_url: produto.imagem ? `${API_URL}/uploads/${produto.imagem}` : null
    })) || [];

    res.json(produtosComImagem);

  } catch (err) {
    console.error("❌ Erro:", err);
    res.status(500).json({ error: err.message });
  }
}

// ✅ BUSCAR PRODUTO POR ID
export async function buscarProdutoPorId(req, res) {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando produto ID:', id);

    const { data: produto, error } = await supabase
      .from('produtos')
      .select(`
        id_produto,
        nome,
        descricao,
        preco,
        imagem,
        cozinha,
        estoque,
        restaurante,
        categoria(categoria_nome)
      `)
      .eq('id_produto', id)
      .single();

    if (error || !produto) {
      console.log('❌ Produto não encontrado');
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('✅ Produto encontrado:', produto.nome);

    // ✅ ADICIONAR URL DA IMAGEM
    const produtoComImagem = {
      ...produto,
      imagem_url: produto.imagem ? `${API_URL}/uploads/${produto.imagem}` : null
    };

    res.json(produtoComImagem);

  } catch (err) {
    console.error("❌ Erro:", err);
    res.status(500).json({ error: err.message });
  }
}