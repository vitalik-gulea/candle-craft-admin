import type { DeliveryCitiesRepository } from './ports'

export function listDeliveryCitiesUseCase(repository: DeliveryCitiesRepository) {
  return repository.list()
}
