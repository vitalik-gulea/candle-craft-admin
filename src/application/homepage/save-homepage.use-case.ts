import type { CategoriesRepository } from '../categories/ports'
import type { ProductsRepository } from '../products/ports'
import type { Category } from '../../domain/categories/types'
import type { Product } from '../../domain/products/types'
import type { HomepageSelection } from '../../domain/homepage/types'

interface HomepageSnapshot {
  categories: Category[]
  products: Product[]
}

export async function saveHomepageUseCase(
  categoriesRepository: CategoriesRepository,
  productsRepository: ProductsRepository,
  current: HomepageSnapshot,
  next: HomepageSelection,
): Promise<void> {
  const nextCategoryIds = new Set(next.categoryIds)
  const nextProductIds = new Set(next.productIds)

  const removals = [
    ...current.categories
      .filter((item) => item.showOnHomepage && !nextCategoryIds.has(item.id))
      .map((item) => categoriesRepository.update(item.id, { showOnHomepage: false })),
    ...current.products
      .filter((item) => item.isPopular && !nextProductIds.has(item.id))
      .map((item) => productsRepository.update(item.id, { isPopular: false })),
  ]
  await Promise.all(removals)

  for (const [index, id] of next.categoryIds.entries()) {
    const item = current.categories.find((category) => category.id === id)
    const order = index + 1
    if (item?.showOnHomepage && item.homepageOrder === order) continue
    await categoriesRepository.update(id, { showOnHomepage: true, homepageOrder: order })
  }

  for (const [index, id] of next.productIds.entries()) {
    const item = current.products.find((product) => product.id === id)
    const order = index + 1
    if (item?.isPopular && item.popularOrder === order) continue
    await productsRepository.update(id, { isPopular: true, popularOrder: order })
  }
}
