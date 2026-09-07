import { z } from 'zod'

export const criarRestauranteSchema = z.object({
  usuario: z.string().trim().min(3),
  senha: z.string().min(6),
  confirmarSenha: z.string().min(6),
  nome_restaurante: z.string().trim().min(1),
  estado: z.string().trim().min(2),
  rua: z.string().trim().min(1),
  email: z.string().email(),
  numero_endereco: z.union([z.string().trim().min(1), z.number()]),
  cidade: z.string().trim().min(1)
})

export const atualizarCouvertSchema = z.object({
  status: z.boolean()
})

export const idRestauranteSchema = z.object({
  id: z.coerce.number().int().positive()
})