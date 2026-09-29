import type { UnitsOfSaleRepository } from './ports'
import type { UpdateUnitOfSaleInput } from '../../domain/units-of-sale/types'

export function updateUnitOfSaleUseCase(
  repository: UnitsOfSaleRepository,
  id: string,
  input: UpdateUnitOfSaleInput,
) {
  return repository.update(id, input)
}
