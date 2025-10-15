import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import bcrypt from "bcrypt"


dotenv.config()
// Rota para listar funcionarios (filtrada por restaurante do usuário logado)
export async function listarFuncionarios(req, res) {
  try {
    // ✅ VERIFICAR SE TEM TOKEN
    const token = req.headers.authorization?.replace('Bearer ', '');
    let restauranteId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        restauranteId = decoded.restaurante_id;
        console.log(`🏢 Usuário autenticado - Restaurante ID: ${restauranteId}`);
      } catch (tokenError) {
        console.log('⚠️ Token inválido para funcionarios');
        return res.status(401).json({ error: 'Token inválido' });
      }
    } else {
      console.log('📋 Sem token para funcionarios');
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }

    if (!restauranteId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem restaurante associado' });
    }

    const { data, error } = await supabase
      .from('funcionario')
      .select(`
        id_funcionario,
        nome,
        usuario,
        cargo,
        restaurante (
          id_restaurante,
          nome_restaurante
        )
      `)
      .eq('restaurante', restauranteId)
      .order('nome', { ascending: true });
 

    if (error) return res.status(500).json({ error: error.message });
    
    console.log(`👥 Funcionarios encontrados para restaurante ${restauranteId}:`, data.length);
    res.json(data);
  } catch (err) {
    console.error('Erro ao listar funcionarios:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function criarFuncionario(req, res) {


  const { nome, cargo, restaurante, usuario, senha, confirmarSenha } = req.body;

  if(!nome) {
        return res.status(422).json({ msg: 'O nome é obrigatorio!'});
    }

    if(!cargo) {
        return res.status(422).json({ msg: 'O cargo é obrigatorio!'});
    }

    if(!restaurante) {
        return res.status(422).json({ msg: 'O restarante é obrigatoria!'});
    }
    if(!usuario) {
        return res.status(422).json({ msg: 'O usuario é obrigatoria!'});
    }
    if(!senha) {
        return res.status(422).json({ msg: 'A senha é obrigatoria!'});
    }

    if(senha !== confirmarSenha) {
        return res.status(422).json({ msg: 'As senhas nao conferem!'});
    }

    try {
    // ✅ VERIFICAR SE USUÁRIO JÁ EXISTE (SUPABASE CORRETO)
    const { data: userExists, error: checkError } = await supabase
      .from('funcionario')  // Verificar se é 'funcionario' ou 'funcionarios'
      .select('usuario')
      .eq('usuario', usuario)
      .maybeSingle();  // Usa maybeSingle() para não dar erro se não encontrar

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "não encontrado" é OK, outros erros não
      console.error('Erro ao verificar usuário:', checkError);
      return res.status(500).json({ msg: 'Erro ao verificar usuário existente' });
    }

    if (userExists) {
      return res.status(422).json({ msg: 'Já existe um usuário com esse nome!' });
    }
    if(userExists){
        return res.status(422).json({ msg: 'Ja existe um usuario com esse nome!'});
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)


  const { data, error, } = await supabase
  .from('funcionario')
  .insert([{ nome, cargo, restaurante, usuario, senha: passwordHash }])

  if (error) return res.status(500).json({ error: error.message});
  res.json({ message: 'Funcionario cadastrado com sucesso'})

}  catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

// cadastra funcionario no pedido
export async function cadastrarFuncionario(req, res) {
  const { id, nome } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ id, nome }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'funcionario cadastrado com sucesso!', produto: data[0] });
};


export async function editarFuncionario(req, res) {
  const { id } = req.params;
  const { campo, novoValor } = req.body;


  const colunasPermitidas = ["nome", "usuario", "cargo", "restaurante"];

  if (!colunasPermitidas.includes(campo)) {
    return res.status(400).json({ error: "Campo inválido para atualização" });
  }

  console.log("📩 Dados recebidos no editarFuncionario:", req.params, req.body);

  try {
    const { data: funcionarioAtual, error: errorSelect } = await supabase
      .from("funcionario")
      .select("id_funcionario")
      .eq("id_funcionario", id)
      .single();

    if (errorSelect || !funcionarioAtual) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    const { data, error } = await supabase
      .from("funcionario")
      .update({ [campo]: novoValor })
      .eq("id_funcionario", id)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar funcionário" });
    }

   
    res.json({ message: "Funcionário atualizado com sucesso!", funcionario: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro inesperado ao atualizar funcionário" });
  }
}
