import * as categoriaRepository from '../repositories/categoriaRepository.js'

export async function listar() {
  const { data, error } = await categoriaRepository.listar()
  if (error) throw error
  return data
}