import { Alert, Spinner } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCategoryUseCase } from '../../../application/categories/get-category.use-case'
import type { Category } from '../../../domain/categories/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { useTranslation } from '../../../shared/i18n'
import { CreateCategoryForm } from '../../features/categories/CreateCategoryForm'

export function EditCategoryPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!id) return
    setCategory(null)
    setHasError(false)
    void getCategoryUseCase(categoriesApi, id)
      .then(setCategory)
      .catch(() => setHasError(true))
  }, [id])

  if (hasError) {
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Title>{t('categories.errors.notFound')}</Alert.Title>
        </Alert.Content>
      </Alert>
    )
  }

  if (!category) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <CreateCategoryForm key={category.id} category={category} />
    </motion.div>
  )
}
