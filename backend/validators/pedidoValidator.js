import { z } from 'zod'

const itemSchema = z.object({
  produto_id: z.coerce.number().int().positive().optional(),
  id_produto: z.coerce.number().int().positive().optional(),
  quantidade: z.coerce.number().int().positive().optional(),
  preco: z.coerce.number().nonnegative().optional()
}).passthrough().refine(
  item => item.produto_id !== undefined || item.id_produto !== undefined,
  { message: 'O item deve informar produto_id ou id_produto' }
)

export const criarPedidoSchema = z.object({
  cliente: z.string().trim().min(1),
  funcionario: z.coerce.number().int().positive(),
  casa: z.string().trim().min(1),
  itens: z.array(itemSchema).min(1),
  obs: z.string().trim().optional().default(''),
  total: z.coerce.number().nonnegative()
})

export const atualizarStatusPedidoSchema = z.object({
  status: z.enum(['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'])
})

export const idPedidoSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const relatorioPedidoQuerySchema = z.object({
  data_inicio: z.string().optional(),
  data_fim: z.string().optional()
})