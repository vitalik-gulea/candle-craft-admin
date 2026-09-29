import type { UploadedImage } from '../../domain/uploads/types'

export interface UploadsRepository {
  uploadImage(file: File): Promise<UploadedImage>
}
