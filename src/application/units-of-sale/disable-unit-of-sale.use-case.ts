import type { UnitsOfSaleRepository } from './ports'

export function disableUnitOfSaleUseCase(
  repository: UnitsOfSaleRepository,
  id: string,
) {
  return repository.disable(id)
}
