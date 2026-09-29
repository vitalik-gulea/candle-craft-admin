import type { UploadsRepository } from '../../application/uploads/ports'
import type { UploadedImage } from '../../domain/uploads/types'
import { httpClient } from '../http/http-client'

export const uploadsApi: UploadsRepository = {
  async uploadImage(file: File): Promise<UploadedImage> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await httpClient.post<{ key: string; publicUrl: string }>(
      '/v1/storage/images',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return { url: data.publicUrl, key: data.key }
  },
}
