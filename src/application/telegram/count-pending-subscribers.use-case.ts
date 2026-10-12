import type { TelegramRepository } from './ports'

export async function countPendingTelegramSubscribersUseCase(repository: TelegramRepository) {
  const page = await repository.listSubscribers({ status: 'pending', page: 1, limit: 1 })
  return page.total
}
