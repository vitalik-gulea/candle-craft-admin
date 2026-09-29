import type { UploadsRepository } from './ports'

export function uploadImageUseCase(repository: UploadsRepository, file: File) {
  return repository.uploadImage(file)
}
