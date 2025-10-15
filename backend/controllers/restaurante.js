import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// ✅ LISTAR PRODUTOS (COM FILTRO POR RESTAURANTE SE AUTENTICADO)
export async function listarCargo(req, res) {
  const { data, error } = await supabase
    .from("cargo")
    .select("*")
    .order("id", { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function criarRestaurante(req, res) {

  const { usuario, senha, nome_restaurante, estado, rua, numero_endereco, cidade, confirmarSenha  } = req.body;
  
  if(!usuario) {
        return res.status(422).json({ msg: 'O nome é obrigatorio!'});
    }

    if(!nome_restaurante) {
        return res.status(422).json({ msg: 'O cargo é obrigatorio!'});
    }

    if(!estado) {
        return res.status(422).json({ msg: 'O restarante é obrigatoria!'});
    }
    if(!rua) {
        return res.status(422).json({ msg: 'O usuario é obrigatoria!'});
    }
    if(!numero_endereco) {
        return res.status(422).json({ msg: 'O usuario é obrigatoria!'});
    }
    if(!cidade) {
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
      .from('restaurante') 
      .select('usuario')
      .eq('usuario', usuario)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "não encontrado" é OK, outros erros não
      console.error('Erro ao verificar usuário:', checkError);
      return res.status(500).json({ msg: 'Erro ao verificar usuário existente' });
    }

    if (userExists) {
        return res.status(422).json({ msg: 'Já existe um usuário com esse nome!' });
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)


  const { data, error, } = await supabase
  .from('restaurante')
  .insert([{ usuario, nome_restaurante, estado, rua, numero_endereco, cidade, senha: passwordHash }])

  if (error) return res.status(500).json({ error: error.message});
  res.json({ message: 'Restaurante cadastrado com sucesso'})

}  catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}
