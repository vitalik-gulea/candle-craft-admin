import type {
  CharacteristicType,
  CharacteristicTypeValue,
  CreateCharacteristicTypeValueInput,
  CharacteristicTypeListFilters,
  CreateCharacteristicTypeInput,
  UpdateCharacteristicTypeInput,
} from '../../domain/characteristic-types/types'

export interface CharacteristicTypesRepository {
  list(filters?: CharacteristicTypeListFilters): Promise<CharacteristicType[]>
  create(input: CreateCharacteristicTypeInput): Promise<CharacteristicType>
  update(id: string, input: UpdateCharacteristicTypeInput): Promise<CharacteristicType>
  disable(id: string): Promise<void>
  listValues(characteristicTypeId: string): Promise<CharacteristicTypeValue[]>
  createValue(
    characteristicTypeId: string,
    input: CreateCharacteristicTypeValueInput,
  ): Promise<CharacteristicTypeValue>
}
