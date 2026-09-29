import type { ProductsRepository } from './ports'
import type { PermanentlyDeleteProductInput } from '../../domain/products/types'

export function permanentlyDeleteProductUseCase(
  repository: ProductsRepository,
  id: string,
  input?: PermanentlyDeleteProductInput,
) {
  return repository.permanentlyDelete(id, input)
}
