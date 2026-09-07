import * as cargoRepository from '../repositories/cargoRepository.js'

export async function listar() {
  const { data, error } = await cargoRepository.listar()
  if (error) throw error
  return data
}