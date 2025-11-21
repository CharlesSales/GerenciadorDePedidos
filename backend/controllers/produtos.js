import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'

// ✅ OTIMIZAÇÃO: Cache simples em memória
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ✅ LISTAR PRODUTOS (COM FILTRO POR RESTAURANTE SE AUTENTICADO)
export async function listarProdutos(req, res) {
  try {
    console.log('📦 Listando produtos...');

    const cacheKey = 'produtos_list';
    const cached = cache.get(cacheKey);

    // Verificar cache
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('📦 Produtos servidos do cache');
      return res.json(cached.data);
    }

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
      .order('id_produto', { ascending: true });

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

export async function listarProdutosPorRestaurante(req, res) {
  try {
    const { restauranteId } = req.params;
    console.log('🏪 ID recebido:', restauranteId, 'Tipo:', typeof restauranteId);

    // 🔍 DEBUG: Verificar se existem restaurantes
    const { data: todosRestaurantes, error: debugError } = await supabase
      .from('restaurante')
      .select('id_restaurante, nome_restaurante');

    console.log('🔍 RESTAURANTES NO BANCO:', todosRestaurantes);

    if (!todosRestaurantes || todosRestaurantes.length === 0) {
      return res.status(404).json({
        error: 'Nenhum restaurante encontrado no banco de dados',
        codigo: 'NENHUM_RESTAURANTE'
      });
    }

    // Converter para número
    const restauranteIdNum = parseInt(restauranteId, 10);
    console.log('🔍 Buscando restaurante ID:', restauranteIdNum);

    // ✅ BUSCAR RESTAURANTE ESPECÍFICO
    const { data: restaurante, error: restauranteError } = await supabase
      .from('restaurante')
      .select('id_restaurante, nome_restaurante, estado, cidade')
      .eq('id_restaurante', restauranteIdNum)
      .single();

    console.log('🔍 RESULTADO DA BUSCA:', restaurante);
    console.log('🔍 ERRO:', restauranteError);

    if (restauranteError || !restaurante) {
      return res.status(404).json({
        error: 'Restaurante não encontrado',
        codigo: 'RESTAURANTE_NAO_ENCONTRADO',
        debug: {
          idBuscado: restauranteIdNum,
          restaurantesDisponiveis: todosRestaurantes.map(r => r.id_restaurante)
        }
      });
    }

    // ✅ BUSCAR PRODUTOS DO RESTAURANTE
    const { data: produtos, error: produtosError } = await supabase
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
      .eq('restaurante', restauranteIdNum)
    // .eq('estoque', true);

    if (produtosError) {
      console.error('❌ Erro ao buscar produtos:', produtosError);
      return res.status(500).json({ error: produtosError.message });
    }

    console.log(`✅ ${produtos?.length || 0} produtos encontrados`);

    res.json({
      restaurante: {
        id: restaurante.id_restaurante,
        nome: restaurante.nome_restaurante
      },
      produtos: produtos || [],
      total: produtos?.length || 0
    });

  } catch (err) {
    console.error("❌ ERRO:", err);
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";

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

// cadastrarProdutos
export async function cadastrarProdutos(req, res) {
  console.log("Arquivo recebido:", req.file);

  try {
    console.log("Dados recebidos:", req.body);
    console.log("Arquivo recebido:", req.file);

    const { nome, descricao, preco, estoque, cozinha, categoria, restaurante } = req.body;
    const file = req.file; // ✅ IMAGEM OPCIONAL
  
    // ✅ VALIDAÇÕES OBRIGATÓRIAS (SEM IMAGEM)
    if(!nome) {
        return res.status(422).json({ msg: 'O nome é obrigatório!'});
    }

    if(!descricao) {
        return res.status(422).json({ msg: 'A descrição é obrigatória!'});
    }

    if(!preco) {
        return res.status(422).json({ msg: 'O preço é obrigatório!'});
    }
    
    if(!estoque) {
        return res.status(422).json({ msg: 'O estoque é obrigatório!'});
    }
   
    if(!categoria) {
        return res.status(422).json({ msg: 'A categoria é obrigatória!'});
    }
    
    if(!restaurante) {
        return res.status(422).json({ msg: 'O restaurante é obrigatório!'});
    }

    // ✅ VERIFICAR SE PRODUTO JÁ EXISTE
    const { data: exists, error: checkError } = await supabase
      .from('produtos') 
      .select('nome')
      .eq('nome', nome)
      .eq('restaurante', restaurante)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar produto:', checkError);
      return res.status(500).json({ msg: 'Erro ao verificar produto existente' });
    }

    if (exists) {
        return res.status(422).json({ msg: 'Já existe um produto com esse nome neste restaurante!' });
    }

    // ✅ PROCESSAR IMAGEM APENAS SE ENVIADA
    let imageUrl = null;
    
    if (file) {
      console.log('📷 Processando upload da imagem...');
      
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(422).json({ 
          msg: 'Tipo de arquivo inválido. Use apenas: JPEG, PNG, GIF ou WebP' 
        });
      }

      // Validar tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(422).json({ 
          msg: 'Arquivo muito grande. Tamanho máximo: 5MB' 
        });
      }

      // Gerar nome único para o arquivo
      const fileName = `produto-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
      
      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(fileName, file.buffer, { 
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Erro ao fazer upload da imagem:", uploadError);
        return res.status(500).json({ 
          msg: "Erro ao fazer upload da imagem",
          details: uploadError.message 
        });
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from("imagens")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
      console.log('✅ Imagem enviada com sucesso:', imageUrl);
    } else {
      console.log('📷 Nenhuma imagem enviada, produto será criado sem imagem');
    }

    // ✅ INSERIR PRODUTO NO BANCO (CORREÇÃO AQUI)
    const { data: produtoData, error: insertError } = await supabase
      .from('produtos')
      .insert([
        { 
          nome, 
          descricao, 
          preco: parseFloat(preco),
          estoque: parseInt(estoque),
          cozinha, 
          categoria: parseInt(categoria),
          restaurante: parseInt(restaurante),
          imagem: imageUrl
        }
      ])
      .select();

    // ✅ VERIFICAR ERRO DE INSERÇÃO
    if (insertError) {
      console.error('❌ Erro ao inserir produto:', insertError);
      
      // Se houve erro e imagem foi enviada, deletar a imagem
      if (imageUrl && file) {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from("imagens").remove([fileName]);
        console.log('🗑️ Imagem removida devido ao erro na inserção');
      }
      
      return res.status(500).json({ 
        msg: 'Erro ao cadastrar produto',
        details: insertError.message 
      });
    }

    // ✅ VERIFICAR SE DADOS FORAM RETORNADOS
    if (!produtoData || produtoData.length === 0) {
      console.error('❌ Nenhum dado retornado após inserção');
      return res.status(500).json({ 
        msg: 'Erro: produto não foi inserido corretamente' 
      });
    }

    // ✅ LIMPAR CACHE
    cache.delete('produtos_list');
    console.log('🗑️ Cache de produtos limpo');

    console.log('✅ Produto cadastrado com sucesso:', produtoData[0]);

    // ✅ RESPOSTA DE SUCESSO
    res.status(201).json({ 
      success: true,
      message: 'Produto cadastrado com sucesso!',
      produto: produtoData[0], // ✅ AGORA USA produtoData
      temImagem: !!imageUrl
    });

  } catch (err) {
    console.error('❌ Erro interno:', err);
    res.status(500).json({ 
      msg: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
  }
}


// atualizarrodutos
export async function editarprodutos(req, res) {
  const { id } = req.params;
  const { campo, novoValor } = req.body;


  const colunasPermitidas = ['nome', 'descricao', 'preco', 'imagem', 'cozinha', 'estoque', 'categoria'];

  if (!colunasPermitidas.includes(campo)) {
    return res.status(400).json({ error: "Campo inválido para atualização" });
  }

  console.log("📩 Dados recebidos no editarFuncionario:", req.params, req.body);

  try {
    const { data: produtoAtual, error: errorSelect } = await supabase
      .from("produtos")
      .select("id_produto")
      .eq("id_produto", id)
      .single();

    if (errorSelect || !produtoAtual) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const { data, error } = await supabase
      .from("produtos")
      .update({ [campo]: novoValor })
      .eq("id_produto", id)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar produtos" });
    }


    res.json({ message: "Funcionário atualizado com sucesso!", produtos: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro inesperado ao atualizar produto" });
  }
}


export async function deletarProduto(req, res) {
  const { id } = req.params;

  try {
    console.log('🗑️ Deletando produto ID:', id);

    const produtoId = parseInt(id);


    // ✅ DELETAR O PRODUTO (SEM .single())
    const { data, error } = await supabase
      .from("produtos")
      .delete()
      .eq("id_produto", produtoId);

    if (error) {
      console.error('❌ Erro ao deletar:', error);
      return res.status(500).json({
        error: "Erro ao deletar produto",
        details: error.message
      });
    }

    // ✅ LIMPAR CACHE
    cache.delete('produtos_list');
    console.log('🗑️ Cache de produtos limpo');
    res.json({
      success: true,
      message: `Produto deletado com sucesso!`,
      id: produtoId
    });

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: err.message
    });
  }
}

