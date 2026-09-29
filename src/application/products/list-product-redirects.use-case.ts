import type { ProductsRepository } from './ports'

export function listProductRedirectsUseCase(
  repository: ProductsRepository,
  id: string,
) {
  return repository.listRedirects(id)
}
