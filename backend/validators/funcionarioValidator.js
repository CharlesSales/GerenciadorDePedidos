import { z } from 'zod'

export const criarFuncionarioSchema = z.object({
  nome: z.string().trim().min(1),
  cargo: z.coerce.number().int().positive(),
  usuario: z.string().trim().min(3),
  senha: z.string().min(6),
  confirmarSenha: z.string().min(6)
})

export const atualizarFuncionarioSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  usuario: z.string().trim().min(3).optional(),
  cargo: z.coerce.number().int().positive().optional()
}).strict().refine(
  dados => Object.keys(dados).length > 0,
  { message: 'Informe ao menos um campo para atualizar' }
)

export const idFuncionarioSchema = z.object({
  id: z.coerce.number().int().positive()
})