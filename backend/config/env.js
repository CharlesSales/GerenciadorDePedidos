import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('8h'),
  PORT: z.coerce.number().int().positive().default(8080),
  NEXT_PUBLIC_API_URL: z.string().url().default('https://gerenciadordepedidos.onrender.com'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Configuração de ambiente inválida:', result.error.flatten().fieldErrors)
  throw new Error('Variáveis de ambiente obrigatórias ausentes ou inválidas')
}

export const env = {
  supabaseUrl: result.data.SUPABASE_URL,
  supabaseKey: result.data.SUPABASE_KEY,
  jwtSecret: result.data.JWT_SECRET,
  jwtExpiresIn: result.data.JWT_EXPIRES_IN,
  port: result.data.PORT,
  apiUrl: result.data.NEXT_PUBLIC_API_URL,
  nodeEnv: result.data.NODE_ENV
}