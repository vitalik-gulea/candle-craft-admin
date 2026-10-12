import type { InviteUserInput } from '../../domain/auth/types'
import type { AuthRepository } from './ports'

export function inviteUserUseCase(repository: AuthRepository, input: InviteUserInput) {
  return repository.inviteUser(input)
}
