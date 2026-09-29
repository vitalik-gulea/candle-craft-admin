import type { UnitsOfSaleRepository } from './ports'
import type { CreateUnitOfSaleInput } from '../../domain/units-of-sale/types'

export function createUnitOfSaleUseCase(
  repository: UnitsOfSaleRepository,
  input: CreateUnitOfSaleInput,
) {
  return repository.create(input)
}
