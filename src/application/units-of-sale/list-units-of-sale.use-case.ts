import type { UnitsOfSaleRepository } from './ports'
import type { UnitOfSaleListFilters } from '../../domain/units-of-sale/types'

export function listUnitsOfSaleUseCase(
  repository: UnitsOfSaleRepository,
  filters?: UnitOfSaleListFilters,
) {
  return repository.list(filters)
}
