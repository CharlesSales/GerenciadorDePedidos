import { supabase } from "../supabaseClient.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// ✅ LISTAR PRODUTOS (COM FILTRO POR RESTAURANTE SE AUTENTICADO)
export async function listarCargo(req, res) {
  const { data, error } = await supabase
    .from("cargo")
    .select("*")
    .order("id", { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function listarRestaurantes(req, res) {
  const { data, error } = await supabase
    .from('restaurante')
    .select('*')
    .order('id_restaurante')

  if (error) {
    return res.status(404).json({
      msg: 'Erro ao buscar restaurantes'
    })
  }
  res.json(data)

}

export async function criarRestaurante(req, res) {

  const { usuario, senha, nome_restaurante, estado, rua, email, numero_endereco, cidade, confirmarSenha } = req.body;

  if (!usuario || !nome_restaurante || !estado || !rua || !cidade || !numero_endereco || !senha || !email) {
    return res.status(422).json({ msg: 'O nome é obrigatorio!' });
  }

  if (senha !== confirmarSenha) {
    return res.status(422).json({ msg: 'As senhas nao conferem!' });
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

    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ message: 'Restaurante cadastrado com sucesso' })

  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function adicionarCouvert(req, res) {
  const { status, id } = req.body;

  console.log(`O status é: ${status}\nO id é ${id}`)
  if(!id) {
    return res.status(404).json({
      msg: 'O id esta null'
    })
  }
  if (status === null) {
    return res.status(404).json({
      msg: 'O status esta null'
    })
  }


  const { data, error } = await supabase
    .from('restaurante')
    .update({ 'taxaCouvert': status })
    .eq('id_restaurante', id)
    .select();

  if (error) {
    return res.status(402).json({
      msg: 'erro ao atualizar status do couvert'
    })
  }

  res.json({
    msg: 'Atualizado com sucesso'
  })

}

export async function statusCouvert(req, res) {
  const { id } = req.params;
  try {
    const { data, error } = await supabase 
      .from('restaurante')
      .select('taxaCouvert')
      .eq('id_restaurante', id)

    if (error) {
      return res.status(402).json({
        msg: 'deu merda'
      })
    }

    res.json(data)

  } catch (err) {
    return res.status(500).json({
      msg: 'erro no servidor'
    })
  }
}