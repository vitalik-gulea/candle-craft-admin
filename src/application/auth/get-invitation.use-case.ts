import type { AuthRepository } from './ports'

export function getInvitationUseCase(repository: AuthRepository, token: string) {
  return repository.getInvitation(token)
}
