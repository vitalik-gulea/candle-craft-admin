import { Button, Spinner, toast } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../shared/i18n'
import type { HomepageOption } from '../../features/homepage/homepage-types'
import { HomepageSection } from '../../features/homepage/HomepageSection'
import { formatProductPrice } from '../../features/products/product-display'
import { useHomepageStore } from '../../stores/homepage.store'

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function HomepagePage() {
  const { t, locale } = useTranslation()
  const categories = useHomepageStore((state) => state.categories)
  const products = useHomepageStore((state) => state.products)
  const isLoading = useHomepageStore((state) => state.isLoading)
  const isSaving = useHomepageStore((state) => state.isSaving)
  const hasLoadError = useHomepageStore((state) => state.hasLoadError)
  const load = useHomepageStore((state) => state.load)
  const save = useHomepageStore((state) => state.save)

  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [productIds, setProductIds] = useState<string[]>([])

  useEffect(() => {
    void load()
  }, [load])

  const savedCategoryIds = useMemo(
    () =>
      categories
        .filter((item) => item.showOnHomepage)
        .sort((a, b) => a.homepageOrder - b.homepageOrder)
        .map((item) => item.id),
    [categories],
  )
  const savedProductIds = useMemo(
    () =>
      products
        .filter((item) => item.isPopular)
        .sort((a, b) => a.popularOrder - b.popularOrder)
        .map((item) => item.id),
    [products],
  )

  useEffect(() => {
    setCategoryIds(savedCategoryIds)
  }, [savedCategoryIds])

  useEffect(() => {
    setProductIds(savedProductIds)
  }, [savedProductIds])

  const withStatus = (text: string, status: string) =>
    status === 'published' ? text : `${text} · ${t('homepage.notPublished')}`

  const categoryOptions = useMemo<HomepageOption[]>(
    () =>
      categories.map((item) => ({
        id: item.id,
        title: item.name[locale],
        subtitle: withStatus(`/${item.slug[locale]}`, item.status),
        imageUrl: item.imageUrl,
      })),
    [categories, locale],
  )
  const productOptions = useMemo<HomepageOption[]>(
    () =>
      products.map((item) => ({
        id: item.id,
        title: item.name[locale],
        subtitle: withStatus(formatProductPrice(item.effectivePrice), item.status),
        imageUrl: item.mainImageUrl,
      })),
    [products, locale],
  )

  const pick = (options: HomepageOption[], ids: string[]) =>
    ids
      .map((id) => options.find((option) => option.id === id))
      .filter((option): option is HomepageOption => option !== undefined)

  const isDirty =
    !sameIds(categoryIds, savedCategoryIds) || !sameIds(productIds, savedProductIds)

  function handleReset() {
    setCategoryIds(savedCategoryIds)
    setProductIds(savedProductIds)
  }

  async function handleSave() {
    const result = await save({ categoryIds, productIds })
    if (result.status === 'ok') {
      toast.success(t('homepage.toasts.saved'))
      return
    }
    const details = Array.isArray(result.details) ? result.details.join(', ') : result.details
    toast.danger(details ?? t('homepage.errors.unknown'))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.homepage')}</h1>
          <p className="text-sm text-muted">{t('homepage.subtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            isDisabled={!isDirty || isSaving}
            onPress={handleReset}
            className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
          >
            {t('homepage.actions.reset')}
          </Button>
          <Button
            isDisabled={!isDirty}
            isPending={isSaving}
            onPress={() => void handleSave()}
            className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      {isLoading && categories.length === 0 && products.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : hasLoadError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-field-border bg-white">
          <p className="text-sm text-ink">{t('homepage.errors.load')}</p>
          <Button
            variant="outline"
            onPress={() => void load()}
            className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          <HomepageSection
            title={t('homepage.categories.title')}
            hint={t('homepage.categories.hint')}
            addLabel={t('homepage.categories.add')}
            pickerTitle={t('homepage.categories.pickerTitle')}
            searchPlaceholder={t('homepage.categories.search')}
            emptySlotLabel={t('homepage.emptySlot')}
            selected={pick(categoryOptions, categoryIds)}
            available={categoryOptions}
            isDisabled={isSaving}
            onChange={setCategoryIds}
          />
          <HomepageSection
            title={t('homepage.products.title')}
            hint={t('homepage.products.hint')}
            addLabel={t('homepage.products.add')}
            pickerTitle={t('homepage.products.pickerTitle')}
            searchPlaceholder={t('homepage.products.search')}
            emptySlotLabel={t('homepage.emptySlot')}
            selected={pick(productOptions, productIds)}
            available={productOptions}
            isDisabled={isSaving}
            onChange={setProductIds}
          />
        </>
      )}
    </motion.div>
  )
}
