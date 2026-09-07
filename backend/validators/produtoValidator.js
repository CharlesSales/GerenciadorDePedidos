import { z } from 'zod'

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: z.string().trim().min(1),
  preco: z.coerce.number().nonnegative(),
  estoque: z.coerce.number().int().nonnegative(),
  cozinha: z.string().trim().optional().default(''),
  categoria: z.coerce.number().int().positive()
})

export const atualizarProdutoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  descricao: z.string().trim().min(1).optional(),
  preco: z.coerce.number().nonnegative().optional(),
  imagem: z.string().trim().nullable().optional(),
  cozinha: z.string().trim().optional(),
  estoque: z.coerce.number().int().nonnegative().optional(),
  categoria: z.coerce.number().int().positive().optional()
}).strict().refine(
  dados => Object.keys(dados).length > 0,
  { message: 'Informe ao menos um campo para atualizar' }
)

export const idProdutoSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const restauranteProdutoParamsSchema = z.object({
  restauranteId: z.coerce.number().int().positive()
})

export const qrCodeProdutoParamsSchema = z.object({
  id_restaurante: z.coerce.number().int().positive(),
  id_mesa: z.coerce.number().int().positive()
})