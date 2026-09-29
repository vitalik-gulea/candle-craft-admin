import type {
  CreateProductInput,
  PermanentlyDeleteProductInput,
  Product,
  ProductImage,
  ProductImageInput,
  ProductListFilters,
  ProductUrlRedirect,
  UpdateProductInput,
} from '../../domain/products/types'

export interface ProductsRepository {
  list(filters?: ProductListFilters): Promise<Product[]>
  getById(id: string): Promise<Product>
  create(input: CreateProductInput): Promise<Product>
  update(id: string, input: UpdateProductInput): Promise<Product>
  trash(id: string): Promise<void>
  restore(id: string): Promise<Product>
  permanentlyDelete(id: string, input?: PermanentlyDeleteProductInput): Promise<void>
  copy(id: string): Promise<Product>
  listImages(id: string): Promise<ProductImage[]>
  replaceImages(id: string, images: ProductImageInput[]): Promise<ProductImage[]>
  listRedirects(id: string): Promise<ProductUrlRedirect[]>
}
