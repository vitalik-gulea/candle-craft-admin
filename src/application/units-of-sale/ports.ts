import type {
  CreateUnitOfSaleInput,
  UnitOfSale,
  UnitOfSaleListFilters,
  UpdateUnitOfSaleInput,
} from '../../domain/units-of-sale/types'

export interface UnitsOfSaleRepository {
  list(filters?: UnitOfSaleListFilters): Promise<UnitOfSale[]>
  create(input: CreateUnitOfSaleInput): Promise<UnitOfSale>
  update(id: string, input: UpdateUnitOfSaleInput): Promise<UnitOfSale>
  disable(id: string): Promise<void>
}
