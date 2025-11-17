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
    console.log("Arquivo recebido:", req.file);

    const { nome, descricao, preco, estoque, cozinha, categoria, restaurante } = req.body;
    const file = req.file; // imagem enviada pelo cliente
  
  if(!nome) {
        return res.status(422).json({ msg: 'O nome é obrigatorio!'});
    }

    if(!descricao) {
        return res.status(422).json({ msg: 'O descricao é obrigatorio!'});
    }

    if(!preco) {
        return res.status(422).json({ msg: 'O preco é obrigatoria!'});
    }
    if(!estoque) {
        return res.status(422).json({ msg: 'O estoque é obrigatoria!'});
    }
    if(!estoque) {
        return res.status(422).json({ msg: 'O cozinha é obrigatoria!'});
    }
    if(!cozinha) {
        return res.status(422).json({ msg: 'O categoria é obrigatoria!'});
    }
    if(!categoria) {
        return res.status(422).json({ msg: 'O categoria é obrigatoria!'});
    }
    if(!restaurante) {
        return res.status(422).json({ msg: 'O restaurante é obrigatoria!'});
    }

    // ✅ VERIFICAR SE USUÁRIO JÁ EXISTE (SUPABASE CORRETO)
    const { data: exists, error: checkError } = await supabase
      .from('produtos') 
      .select('nome')
      .eq('nome', nome)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "não encontrado" é OK, outros erros não
      console.error('Erro ao verificar usuário:', checkError);
      return res.status(500).json({ msg: 'Erro ao verificar usuário existente' });
    }

    if (exists) {
        return res.status(422).json({ msg: 'Já existe um usuário com esse nome!' });
    }

    // Envia imagem para o Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`; 
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("imagens")
      .upload(fileName, file.buffer, { contentType: file.mimetype });
    // remover arquivo temporário depois
  



    if (uploadError) {
      console.error("Erro ao fazer upload da imagem:", uploadError);
      return res.status(500).json({ msg: "Erro ao fazer upload da imagem" });
    }

    // 🔗 Pega a URL pública
    const { data: publicUrlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;


    const { data, error } = await supabase
    .from('produtos')
    .insert([
      { nome, descricao, preco, estoque, cozinha, categoria, restaurante, imagem: imageUrl } // sem id_produto
    ])
    .select(); // optional: retorna o registro inserido


    cache.delete('produtos_list');
    console.log('🗑️ Cache de produtos limpo');

  if (error) return res.status(500).json({ error: error.message});
  res.json({ message: 'Restaurante cadastrado com sucesso'})

}  catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}




// atualizarrodutos
export async function editarprodutos(req, res) {
  const { id } = req.params;
  const { campo, novoValor } = req.body;


  const colunasPermitidas = ['nome', 'descricao', 'preco', 'imagem', 'cozinha', 'estoque', 'restaurante', 'categoria'];

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
produto
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
    res.status(500).json({ error: "Erro inesperado ao atualizar funcionário" });
  }
}