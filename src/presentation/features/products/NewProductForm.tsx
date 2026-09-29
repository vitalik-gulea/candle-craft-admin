import { parseDate, type CalendarDate } from '@internationalized/date'
import {
  Alert,
  Button,
  Calendar,
  DateField,
  DatePicker,
  Dropdown,
  FieldError,
  Form,
  I18nProvider,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Spinner,
  Switch,
  TextArea,
  TextField,
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, type Control, type Path, type RegisterOptions } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { listCategorySummariesUseCase } from '../../../application/categories/list-category-summaries.use-case'
import { getProductUseCase } from '../../../application/products/get-product.use-case'
import { listProductImagesUseCase } from '../../../application/products/list-product-images.use-case'
import { listUnitsOfSaleUseCase } from '../../../application/units-of-sale/list-units-of-sale.use-case'
import { uploadImageUseCase } from '../../../application/uploads/upload-image.use-case'
import type { CategorySummary } from '../../../domain/categories/types'
import type { CreateProductInput, Product, ProductStatus } from '../../../domain/products/types'
import type { UnitOfSale } from '../../../domain/units-of-sale/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { productsApi } from '../../../infrastructure/products/products.api'
import { unitsOfSaleApi } from '../../../infrastructure/units-of-sale/units-of-sale.api'
import { uploadsApi } from '../../../infrastructure/uploads/uploads.api'
import { useTranslation } from '../../../shared/i18n'
import { slugify } from '../../../shared/utils/slugify'
import { useProductsStore } from '../../stores/products.store'
import { UnitOfSaleModal } from '../units-of-sale/UnitOfSaleModal'

type UploadedSlot = { url: string; key: string }

interface NewProductFormValues {
  nameRo: string
  nameRu: string
  shortDescriptionRo: string
  shortDescriptionRu: string
  fullDescriptionRo: string
  fullDescriptionRu: string
  slugRo: string
  slugRu: string
  sku: string
  regularPrice: string
  discountPrice: string
  discountStartAt: string
  discountEndAt: string
  stockQuantity: number
  mainCategoryId: string
  additionalCategoryIds: string[]
  unitOfSaleId: string
  status: ProductStatus
  isNewBadgeEnabled: boolean
  seoTitleRo: string
  seoTitleRu: string
  metaDescriptionRo: string
  metaDescriptionRu: string
  mainImageAltRo: string
  mainImageAltRu: string
}

const DEFAULT_VALUES: NewProductFormValues = {
  nameRo: '',
  nameRu: '',
  shortDescriptionRo: '',
  shortDescriptionRu: '',
  fullDescriptionRo: '',
  fullDescriptionRu: '',
  slugRo: '',
  slugRu: '',
  sku: '',
  regularPrice: '',
  discountPrice: '',
  discountStartAt: '',
  discountEndAt: '',
  stockQuantity: 0,
  mainCategoryId: '',
  additionalCategoryIds: [],
  unitOfSaleId: '',
  status: 'draft',
  isNewBadgeEnabled: false,
  seoTitleRo: '',
  seoTitleRu: '',
  metaDescriptionRo: '',
  metaDescriptionRu: '',
  mainImageAltRo: '',
  mainImageAltRu: '',
}

function toDateInput(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

function toCalendarDate(value: string): CalendarDate | null {
  if (!value) return null
  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return null
  }
}

function productToFormValues(product: Product): NewProductFormValues {
  return {
    nameRo: product.name.ro,
    nameRu: product.name.ru,
    shortDescriptionRo: product.shortDescription.ro ?? '',
    shortDescriptionRu: product.shortDescription.ru ?? '',
    fullDescriptionRo: product.fullDescription.ro ?? '',
    fullDescriptionRu: product.fullDescription.ru ?? '',
    slugRo: product.slug.ro,
    slugRu: product.slug.ru,
    sku: product.sku ?? '',
    regularPrice: product.regularPrice ?? '',
    discountPrice: product.discountPrice ?? '',
    discountStartAt: toDateInput(product.discountStartAt),
    discountEndAt: toDateInput(product.discountEndAt),
    stockQuantity: product.stockQuantity,
    mainCategoryId: product.mainCategoryId ?? '',
    additionalCategoryIds: product.additionalCategoryIds,
    unitOfSaleId: product.unitOfSaleId ?? '',
    status: product.status,
    isNewBadgeEnabled: product.isNewBadgeEnabled,
    seoTitleRo: product.seoTitle.ro ?? '',
    seoTitleRu: product.seoTitle.ru ?? '',
    metaDescriptionRo: product.metaDescription.ro ?? '',
    metaDescriptionRu: product.metaDescription.ru ?? '',
    mainImageAltRo: product.mainImageAlt.ro ?? '',
    mainImageAltRu: product.mainImageAlt.ru ?? '',
  }
}

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

const selectTriggerClassName =
  'flex! h-11! w-full! items-center! justify-between! gap-2! rounded-lg! border! border-field-border! bg-surface-soft! px-4! shadow-none!'

const textInputClassName =
  'h-11! w-full! rounded-lg! border! border-field-border! bg-surface-soft! px-3! text-sm! text-accent! shadow-none! outline-none! placeholder:text-accent/45!'

const textAreaClassName =
  'w-full! rounded-lg! border! border-field-border! bg-surface-soft! px-3! py-2.5! text-sm! text-accent! shadow-none! outline-none! placeholder:text-accent/45!'

const selectPopoverClassName =
  'rounded-md! border! border-field-border! bg-[#eef2df]! p-1! shadow-none!'

const selectOptionClassName =
  'min-h-0! w-full! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! leading-[18px]! text-accent! shadow-none! outline-none! data-[focused=true]:bg-accent/10! data-[hovered=true]:bg-accent/10! data-[selected=true]:bg-accent/15!'

function toPriceInputValue(value: number): string {
  if (!Number.isFinite(value)) return ''
  return value.toFixed(2).replace(/\.?0+$/, '')
}
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function Card({ children, tinted }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <div
      className={
        tinted
          ? 'flex w-full flex-col gap-5 rounded-xl border border-field-border bg-surface-soft p-6'
          : 'flex w-full flex-col gap-5 rounded-xl border border-field-border bg-white p-6'
      }
    >
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-heading text-lg font-bold text-accent">{children}</p>
}

function RequiredBadge() {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center rounded-full bg-[#fff4d6] px-2 py-1 text-[11px] font-bold text-accent">
      {t('products.new.requiredBadge')}
    </span>
  )
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-semibold text-accent">{children}</Label>
      {required ? <RequiredBadge /> : null}
    </div>
  )
}

type LangKey = 'ro' | 'ru'

function LangTabs({
  value,
  onChange,
}: {
  value: LangKey
  onChange: (lang: LangKey) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {(['ro', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={
            lang === value
              ? 'rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white'
              : 'rounded-lg border border-field-border bg-surface-soft px-4 py-2.5 text-sm font-semibold text-accent'
          }
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function LangPanel({ langKey, children }: { langKey: LangKey; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={langKey}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex w-full flex-col gap-5"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function ControlledInput({
  control,
  name,
  rules,
  placeholder,
}: {
  control: Control<NewProductFormValues>
  name: Path<NewProductFormValues>
  rules?: RegisterOptions<NewProductFormValues, Path<NewProductFormValues>>
  placeholder?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <Input
          fullWidth
          className={textInputClassName}
          placeholder={placeholder}
          name={field.name}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    />
  )
}

function ControlledTextArea({
  control,
  name,
  rules,
  placeholder,
  rows,
}: {
  control: Control<NewProductFormValues>
  name: Path<NewProductFormValues>
  rules?: RegisterOptions<NewProductFormValues, Path<NewProductFormValues>>
  placeholder?: string
  rows: number
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <TextArea
          fullWidth
          rows={rows}
          className={textAreaClassName}
          placeholder={placeholder}
          name={field.name}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    />
  )
}

function PromotionCalendar({ label }: { label: string }) {
  return (
    <DatePicker.Popover>
      <Calendar aria-label={label}>
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody>
            {({ year }) => <Calendar.YearPickerCell year={year} />}
          </Calendar.YearPickerGridBody>
        </Calendar.YearPickerGrid>
      </Calendar>
    </DatePicker.Popover>
  )
}

function DiscountDateField({
  control,
  name,
  label,
  rules,
  isInvalid,
  onValueChange,
}: {
  control: Control<NewProductFormValues>
  name: 'discountStartAt' | 'discountEndAt'
  label: string
  rules?: RegisterOptions<NewProductFormValues, 'discountStartAt' | 'discountEndAt'>
  isInvalid?: boolean
  onValueChange?: (value: string) => void
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <DatePicker
          className="w-full"
          name={field.name}
          granularity="day"
          isInvalid={isInvalid}
          value={toCalendarDate(field.value)}
          onBlur={field.onBlur}
          onChange={(value) => {
            const next = value ? value.toString() : ''
            field.onChange(next)
            onValueChange?.(next)
          }}
        >
          <Label className="text-sm font-semibold text-accent">{label}</Label>
          <DateField.Group fullWidth className="h-11 bg-surface-soft">
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger type="button">
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <PromotionCalendar label={label} />
        </DatePicker>
      )}
    />
  )
}

function CheckItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <span
        className={
          met
            ? 'size-2 shrink-0 rounded-full bg-accent'
            : 'size-2 shrink-0 rounded-full bg-muted'
        }
      />
      <p className="flex-1 text-sm text-accent">{label}</p>
    </div>
  )
}

interface NewProductFormProps {
  productId?: string
}

export function NewProductForm({ productId }: NewProductFormProps) {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const createDraft = useProductsStore((state) => state.createDraft)
  const updateProduct = useProductsStore((state) => state.update)
  const replaceImages = useProductsStore((state) => state.replaceImages)
  const isMutating = useProductsStore((state) => state.isMutating)
  const allowSlugSync = useRef(!productId)

  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [unitsOfSale, setUnitsOfSale] = useState<UnitOfSale[]>([])
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [basicLang, setBasicLang] = useState<LangKey>('ro')
  const [altLang, setAltLang] = useState<LangKey>('ro')
  const [seoLang, setSeoLang] = useState<LangKey>('ro')

  const [mainImage, setMainImage] = useState<UploadedSlot | null>(null)
  const [galleryImages, setGalleryImages] = useState<UploadedSlot[]>([])
  const [isUploadingMain, setIsUploadingMain] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(Boolean(productId))
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    void listCategorySummariesUseCase(categoriesApi)
      .then(setCategories)
      .catch(() => setCategories([]))
    void listUnitsOfSaleUseCase(unitsOfSaleApi, { includeInactive: true })
      .then(setUnitsOfSale)
      .catch(() => setUnitsOfSale([]))
  }, [])

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<NewProductFormValues>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  })

  const nameRo = watch('nameRo')
  const nameRu = watch('nameRu')
  const resetRef = useRef(reset)
  resetRef.current = reset

  useEffect(() => {
    if (!allowSlugSync.current || dirtyFields.slugRo) return
    setValue('slugRo', slugify(nameRo))
  }, [nameRo, dirtyFields.slugRo, setValue])

  useEffect(() => {
    if (!allowSlugSync.current || dirtyFields.slugRu) return
    setValue('slugRu', slugify(nameRu))
  }, [nameRu, dirtyFields.slugRu, setValue])

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setIsLoadingProduct(true)
    setHasLoadError(false)
    void Promise.all([
      getProductUseCase(productsApi, productId),
      listProductImagesUseCase(productsApi, productId),
    ])
      .then(([product, images]) => {
        if (cancelled) return
        resetRef.current(productToFormValues(product))
        setMainImage(
          product.mainImageUrl && product.mainImageKey
            ? { url: product.mainImageUrl, key: product.mainImageKey }
            : null,
        )
        setGalleryImages(
          [...images]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((image) => ({ url: image.url, key: image.key })),
        )
        setIsLoadingProduct(false)
      })
      .catch(() => {
        if (cancelled) return
        setHasLoadError(true)
        setIsLoadingProduct(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const watched = watch()

  const readiness = useMemo(() => {
    const nameAndSlug = Boolean(
      watched.nameRo.trim() &&
      watched.nameRu.trim() &&
      watched.slugRo.trim() &&
      watched.slugRu.trim(),
    )
    const shortDescription = Boolean(
      watched.shortDescriptionRo.trim() && watched.shortDescriptionRu.trim(),
    )
    const mainCategory = Boolean(watched.mainCategoryId)
    const unitOfSale = Boolean(watched.unitOfSaleId)
    const hasMainImage = mainImage !== null
    const seo = Boolean(
      watched.seoTitleRo.trim() &&
      watched.seoTitleRu.trim() &&
      watched.metaDescriptionRo.trim() &&
      watched.metaDescriptionRu.trim(),
    )
    const priceAndStock = Boolean(watched.regularPrice.trim()) && watched.stockQuantity >= 0

    return {
      nameAndSlug,
      shortDescription,
      mainCategory,
      unitOfSale,
      mainImage: hasMainImage,
      seo,
      priceAndStock,
      all:
        nameAndSlug &&
        shortDescription &&
        mainCategory &&
        unitOfSale &&
        hasMainImage &&
        seo &&
        priceAndStock,
    }
  }, [watched, mainImage])

  const validationErrors: Record<string, string> = {}
  for (const [key, error] of Object.entries(errors)) {
    if (error?.message) validationErrors[key] = String(error.message)
  }

  function emptyToNullish(value: string): string | null | undefined {
    const trimmed = value.trim()
    if (trimmed) return trimmed
    return productId ? null : undefined
  }

  function formatPrice(value: string): string | null | undefined {
    const trimmed = value.trim()
    if (!trimmed) return productId ? null : undefined
    if (!PRICE_PATTERN.test(trimmed)) return trimmed
    const [whole, fraction = ''] = trimmed.split('.')
    return `${whole}.${fraction.padEnd(2, '0')}`
  }

  function formatDateTime(value: string): string | null | undefined {
    if (!value) return productId ? null : undefined
    return new Date(`${value}T00:00:00.000Z`).toISOString()
  }

  function buildInput(status: ProductStatus): CreateProductInput {
    const values = getValues()
    const slugRo = values.slugRo.trim()
    const slugRu = values.slugRu.trim()
    return {
      name: { ro: values.nameRo.trim(), ru: values.nameRu.trim() },
      slug: slugRo || slugRu ? { ro: slugRo, ru: slugRu } : undefined,
      sku: emptyToNullish(values.sku),
      shortDescription: {
        ro: emptyToNullish(values.shortDescriptionRo) ?? null,
        ru: emptyToNullish(values.shortDescriptionRu) ?? null,
      },
      fullDescription: {
        ro: emptyToNullish(values.fullDescriptionRo) ?? null,
        ru: emptyToNullish(values.fullDescriptionRu) ?? null,
      },
      mainCategoryId: values.mainCategoryId || (productId ? null : undefined),
      additionalCategoryIds: values.additionalCategoryIds,
      unitOfSaleId: values.unitOfSaleId || (productId ? null : undefined),
      regularPrice: formatPrice(values.regularPrice),
      discountPrice: formatPrice(values.discountPrice),
      discountStartAt: formatDateTime(values.discountStartAt),
      discountEndAt: formatDateTime(values.discountEndAt),
      stockQuantity: values.stockQuantity,
      status,
      mainImageUrl: mainImage?.url ?? (productId ? null : undefined),
      mainImageKey: mainImage?.key ?? (productId ? null : undefined),
      mainImageAlt: {
        ro: values.mainImageAltRo.trim() || null,
        ru: values.mainImageAltRu.trim() || null,
      },
      seoTitle: {
        ro: emptyToNullish(values.seoTitleRo) ?? null,
        ru: emptyToNullish(values.seoTitleRu) ?? null,
      },
      metaDescription: {
        ro: emptyToNullish(values.metaDescriptionRo) ?? null,
        ru: emptyToNullish(values.metaDescriptionRu) ?? null,
      },
      isNewBadgeEnabled: values.isNewBadgeEnabled,
    }
  }

  function describeFailure(fallback: string) {
    const { errorCode, errorDetails } = useProductsStore.getState()
    if (errorCode === 'CONFLICT') return t('products.errors.conflict')
    if (errorCode === 'NOT_FOUND') return t('products.errors.notFound')
    if (errorCode === 'VALIDATION') {
      if (Array.isArray(errorDetails)) return errorDetails.join(', ')
      return errorDetails || t('products.errors.validation')
    }
    return fallback
  }

  async function submitProduct(status: ProductStatus) {
    setSubmitError(null)
    const input = buildInput(status)
    const product = productId
      ? await updateProduct(productId, input)
      : await createDraft(input)
    if (!product) {
      setSubmitError(
        describeFailure(
          productId
            ? t('products.new.errors.updateFailed')
            : t('products.new.errors.createFailed'),
        ),
      )
      return
    }
    if (productId || galleryImages.length > 0) {
      const images = await replaceImages(
        product.id,
        galleryImages.map((image, index) => ({
          url: image.url,
          key: image.key,
          altRo: getValues('mainImageAltRo').trim() || null,
          altRu: getValues('mainImageAltRu').trim() || null,
          sortOrder: index,
        })),
      )
      if (!images) {
        setSubmitError(t('products.new.errors.galleryFailed'))
        if (!productId) navigate(`/products/${product.id}`)
        return
      }
    }
    navigate('/products')
  }

  async function handleSave() {
    const status = getValues('status')
    if (status === 'published') {
      await handlePublish()
      return
    }
    const isValid = await trigger(['nameRo', 'nameRu'])
    if (!isValid) return
    await submitProduct(status)
  }

  async function handlePublish() {
    const isValid = await trigger()
    if (!isValid || !mainImage) return
    const values = getValues()
    const publishReady = Boolean(
      values.nameRo.trim() &&
      values.nameRu.trim() &&
      values.shortDescriptionRo.trim() &&
      values.shortDescriptionRu.trim() &&
      values.mainCategoryId &&
      values.unitOfSaleId &&
      values.regularPrice.trim() &&
      PRICE_PATTERN.test(values.regularPrice.trim()),
    )
    if (!publishReady) {
      setSubmitError(t('products.new.sections.readiness.blockedHint'))
      return
    }
    setValue('status', 'published')
    await submitProduct('published')
  }

  function handleFillMock() {
    const suffix = Math.random().toString(36).slice(2, 7)
    const nextNameRo = `Lumanare de soia ${suffix}`
    const nextNameRu = `Соевая свеча ${suffix}`
    reset({
      nameRo: nextNameRo,
      nameRu: nextNameRu,
      shortDescriptionRo: 'Lumanare parfumata din ceara de soia, ardere curata.',
      shortDescriptionRu: 'Ароматическая свеча из соевого воска, чистое горение.',
      fullDescriptionRo:
        'Lumanare turnata manual din ceara de soia, cu fitil de bumbac si aroma usoara de vanilie.',
      fullDescriptionRu:
        'Свеча ручной работы из соевого воска, с хлопковым фитилём и лёгким ароматом ванили.',
      slugRo: slugify(nextNameRo),
      slugRu: slugify(nextNameRu),
      sku: `WAX-MOCK-${suffix.toUpperCase()}`,
      regularPrice: '150.00',
      discountPrice: '120.00',
      discountStartAt: '',
      discountEndAt: '',
      stockQuantity: 24,
      mainCategoryId: categories[0]?.id ?? '',
      additionalCategoryIds: categories[1] ? [categories[1].id] : [],
      unitOfSaleId: unitsOfSale[0]?.id ?? '',
      status: 'draft',
      isNewBadgeEnabled: true,
      seoTitleRo: `Lumanare de soia ${suffix} | Candle Craft`,
      seoTitleRu: `Соевая свеча ${suffix} | Candle Craft`,
      metaDescriptionRo: 'Cumpara lumanare de soia Candle Craft, turnata manual.',
      metaDescriptionRu: 'Купить соевую свечу Candle Craft ручной работы.',
      mainImageAltRo: 'Lumanare de soia Candle Craft',
      mainImageAltRu: 'Соевая свеча Candle Craft',
    })
  }

  async function handleUploadMain(file: File) {
    setUploadError(null)
    setIsUploadingMain(true)
    try {
      const uploaded = await uploadImageUseCase(uploadsApi, file)
      setMainImage(uploaded)
    } catch {
      setUploadError(t('products.new.errors.imageUploadFailed'))
    } finally {
      setIsUploadingMain(false)
    }
  }

  async function handleUploadGallery(file: File) {
    setUploadError(null)
    setIsUploadingGallery(true)
    try {
      const uploaded = await uploadImageUseCase(uploadsApi, file)
      setGalleryImages((prev) => [...prev, uploaded])
    } catch {
      setUploadError(t('products.new.errors.imageUploadFailed'))
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const statusOptions: { id: ProductStatus; label: string }[] = [
    {
      id: 'draft',
      label: t('products.new.sections.categoryStatus.statusOptions.draft'),
    },
    {
      id: 'published',
      label: t('products.new.sections.categoryStatus.statusOptions.published'),
    },
    {
      id: 'hidden',
      label: t('products.new.sections.categoryStatus.statusOptions.hidden'),
    },
  ]

  const canPublish = Boolean(
    watched.nameRo.trim() &&
    watched.nameRu.trim() &&
    readiness.shortDescription &&
    readiness.mainCategory &&
    readiness.unitOfSale &&
    readiness.mainImage &&
    watched.regularPrice.trim() &&
    PRICE_PATTERN.test(watched.regularPrice.trim()),
  )
  const saveLabel =
    !productId && watched.status === 'draft'
      ? t('products.new.saveDraft')
      : t('products.new.save')

  if (isLoadingProduct) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (hasLoadError) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Alert status="danger">
          <Alert.Content>
            <Alert.Title>{t('products.new.errors.loadFailed')}</Alert.Title>
          </Alert.Content>
        </Alert>
        <Button
          variant="secondary"
          onPress={() => navigate('/products')}
          className="w-fit rounded-lg border border-accent bg-white px-6 py-3 text-[15px] font-semibold text-accent"
        >
          {t('products.new.breadcrumbProducts')}
        </Button>
      </div>
    )
  }

  return (
    <Form
      validationBehavior="aria"
      validationErrors={validationErrors}
      onSubmit={handleSubmit(() => void handlePublish())}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-accent"
          >
            {t('products.new.breadcrumbProducts')}
          </button>
          <svg className="size-3 text-accent" aria-hidden="true">
            <use href="/icons.svg#chevron-right-icon" />
          </svg>
          <span className="font-medium text-accent">
            {productId ? t('products.new.breadcrumbEdit') : t('products.new.breadcrumbNew')}
          </span>
        </div>

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-[32px] font-bold text-accent">
              {productId ? t('products.new.editTitle') : t('products.new.title')}
            </h1>
            <p className="text-sm text-accent/70">
              {productId ? t('products.new.editSubtitle') : t('products.new.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!productId ? (
              <Button
                type="button"
                variant="secondary"
                isDisabled={isMutating}
                onPress={handleFillMock}
                className="rounded-lg border border-field-border bg-white px-6 py-3 text-[15px] font-semibold text-accent"
              >
                {t('products.new.fillMock')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              isPending={isMutating}
              isDisabled={isMutating}
              onPress={() => void handleSave()}
              className="rounded-lg border border-accent bg-white px-6 py-3 text-[15px] font-semibold text-accent"
            >
              {saveLabel}
            </Button>
            <Button
              type="submit"
              isPending={isMutating}
              isDisabled={isMutating || !canPublish}
              className="rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white disabled:bg-surface-soft disabled:text-accent/45"
            >
              {t('products.new.publish')}
            </Button>
          </div>
        </div>
      </div>

      {submitError ? (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Title>{submitError}</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}

      <div className="flex w-full items-start gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card>
            <CardTitle>{t('products.new.sections.type.title')}</CardTitle>
            <div className="flex w-full gap-3">
              <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-accent bg-surface-soft p-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-accent" />
                  <p className="text-sm font-semibold text-accent">
                    {t('products.new.sections.type.simple')}
                  </p>
                </div>
                <p className="text-[13px] text-accent/75">
                  {t('products.new.sections.type.simpleHint')}
                </p>
              </div>
              <div className="flex flex-1 cursor-not-allowed flex-col gap-2 rounded-[10px] border border-field-border bg-surface-soft p-4 opacity-50">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full border border-field-border" />
                  <p className="text-sm font-semibold text-accent">
                    {t('products.new.sections.type.variations')}
                  </p>
                </div>
                <p className="text-[13px] text-accent/75">
                  {t('products.new.sections.type.variationsHint')}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-accent/70">
              {t('products.new.sections.type.note')}
            </p>
          </Card>

          <Card tinted>
            <CardTitle>{t('products.new.sections.basicInfo.title')}</CardTitle>
            <LangTabs value={basicLang} onChange={setBasicLang} />

            <LangPanel langKey={basicLang}>
              <TextField
                name={basicLang === 'ro' ? 'nameRo' : 'nameRu'}
                isInvalid={basicLang === 'ro' ? !!errors.nameRo : !!errors.nameRu}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>
                  {t('products.new.sections.basicInfo.name')}
                </FieldLabel>
                {basicLang === 'ro' ? (
                  <ControlledInput
                    control={control}
                    name="nameRo"
                    placeholder={t('products.new.sections.basicInfo.namePlaceholderRo')}
                    rules={{
                      required: t('products.new.errors.nameRoRequired'),
                      maxLength: {
                        value: 200,
                        message: t('products.new.errors.nameRoRequired'),
                      },
                    }}
                  />
                ) : (
                  <ControlledInput
                    control={control}
                    name="nameRu"
                    placeholder={t('products.new.sections.basicInfo.namePlaceholderRu')}
                    rules={{
                      required: t('products.new.errors.nameRuRequired'),
                      maxLength: {
                        value: 200,
                        message: t('products.new.errors.nameRuRequired'),
                      },
                    }}
                  />
                )}
                <FieldError />
              </TextField>

              <TextField
                name={basicLang === 'ro' ? 'shortDescriptionRo' : 'shortDescriptionRu'}
                isInvalid={
                  basicLang === 'ro'
                    ? !!errors.shortDescriptionRo
                    : !!errors.shortDescriptionRu
                }
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>
                  {t('products.new.sections.basicInfo.shortDescription')}
                </FieldLabel>
                {basicLang === 'ro' ? (
                  <ControlledInput
                    control={control}
                    name="shortDescriptionRo"
                    placeholder={t(
                      'products.new.sections.basicInfo.shortDescriptionPlaceholderRo',
                    )}
                    rules={{
                      required: t('products.new.errors.shortDescriptionRoRequired'),
                      maxLength: 300,
                    }}
                  />
                ) : (
                  <ControlledInput
                    control={control}
                    name="shortDescriptionRu"
                    placeholder={t(
                      'products.new.sections.basicInfo.shortDescriptionPlaceholderRu',
                    )}
                    rules={{
                      required: t('products.new.errors.shortDescriptionRuRequired'),
                      maxLength: 300,
                    }}
                  />
                )}
                <FieldError />
              </TextField>

              <TextField
                name={basicLang === 'ro' ? 'fullDescriptionRo' : 'fullDescriptionRu'}
                isInvalid={
                  basicLang === 'ro'
                    ? !!errors.fullDescriptionRo
                    : !!errors.fullDescriptionRu
                }
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>
                  {t('products.new.sections.basicInfo.fullDescription')}
                </FieldLabel>
                {basicLang === 'ro' ? (
                  <ControlledTextArea
                    control={control}
                    name="fullDescriptionRo"
                    rows={7}
                    placeholder={t(
                      'products.new.sections.basicInfo.fullDescriptionPlaceholderRo',
                    )}
                    rules={{
                      maxLength: 5000,
                    }}
                  />
                ) : (
                  <ControlledTextArea
                    control={control}
                    name="fullDescriptionRu"
                    rows={7}
                    placeholder={t(
                      'products.new.sections.basicInfo.fullDescriptionPlaceholderRu',
                    )}
                    rules={{
                      maxLength: 5000,
                    }}
                  />
                )}
                <FieldError />
              </TextField>
            </LangPanel>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.media.title')}</CardTitle>

            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-accent bg-surface-soft px-6 py-8">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleUploadMain(file)
                  event.target.value = ''
                }}
              />
              <svg className="size-6 text-accent" aria-hidden="true">
                <use href="/icons.svg#upload-cloud-icon" />
              </svg>
              <p className="text-center text-[15px] font-semibold text-accent">
                {isUploadingMain
                  ? t('products.new.sections.media.uploading')
                  : t('products.new.sections.media.dropzoneTitle')}
              </p>
              <p className="text-center text-[13px] text-accent">
                {t('products.new.sections.media.dropzoneHint')}
              </p>
            </label>

            <div className="flex w-full flex-wrap items-start gap-4">
              {mainImage ? (
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-field-border">
                  <img src={mainImage.url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMainImage(null)}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-accent"
                    aria-label={t('products.new.sections.media.remove')}
                  >
                    <svg className="size-3" aria-hidden="true">
                      <use href="/icons.svg#x-icon" />
                    </svg>
                  </button>
                </div>
              ) : null}
              {galleryImages.map((image, index) => (
                <div
                  key={image.key}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-field-border"
                >
                  <img src={image.url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-accent"
                    aria-label={t('products.new.sections.media.remove')}
                  >
                    <svg className="size-3" aria-hidden="true">
                      <use href="/icons.svg#x-icon" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-field-border bg-surface-soft">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleUploadGallery(file)
                    event.target.value = ''
                  }}
                />
                {isUploadingGallery ? (
                  <span className="text-xs text-accent">…</span>
                ) : (
                  <svg className="size-4 text-accent" aria-hidden="true">
                    <use href="/icons.svg#plus-icon" />
                  </svg>
                )}
              </label>
            </div>

            {uploadError ? <p className="text-sm text-danger">{uploadError}</p> : null}

            <LangTabs value={altLang} onChange={setAltLang} />
            <LangPanel langKey={altLang}>
              <div className="flex w-full gap-4">
                <TextField name="mainImageAlt" className="flex flex-1 flex-col gap-2">
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.media.mainImageAlt')}
                  </Label>
                  {altLang === 'ro' ? (
                    <ControlledInput
                      control={control}
                      name="mainImageAltRo"
                      placeholder={t('products.new.sections.media.altPlaceholderRo')}
                    />
                  ) : (
                    <ControlledInput
                      control={control}
                      name="mainImageAltRu"
                      placeholder={t('products.new.sections.media.altPlaceholderRu')}
                    />
                  )}
                </TextField>
              </div>
            </LangPanel>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.inventory.title')}</CardTitle>
            <div className="flex w-full gap-5">
              <div className="flex flex-1 flex-col gap-2">
                <FieldLabel required>
                  {t('products.new.sections.inventory.price')}
                </FieldLabel>
                <Controller
                  control={control}
                  name="regularPrice"
                  rules={{
                    validate: (value) => {
                      if (!value.trim()) return t('products.new.errors.priceRequired')
                      return (
                        PRICE_PATTERN.test(value.trim()) ||
                        t('products.new.errors.priceInvalid')
                      )
                    },
                  }}
                  render={({ field }) => (
                    <NumberField
                      fullWidth
                      minValue={0}
                      step={0.01}
                      formatOptions={{ maximumFractionDigits: 2 }}
                      value={field.value.trim() === '' ? Number.NaN : Number(field.value)}
                      onChange={(value) => {
                        field.onChange(toPriceInputValue(value))
                      }}
                      aria-label={t('products.new.sections.inventory.price')}
                    >
                      <NumberField.Group className="flex h-11 items-center rounded-lg border border-field-border bg-surface-soft px-3">
                        <NumberField.Input className="w-full bg-transparent text-sm text-accent outline-none" />
                      </NumberField.Group>
                    </NumberField>
                  )}
                />
                {errors.regularPrice ? (
                  <p className="text-xs text-danger">{errors.regularPrice.message}</p>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('products.new.sections.inventory.discountPrice')}
                </Label>
                <Controller
                  control={control}
                  name="discountPrice"
                  rules={{
                    validate: (value) => {
                      if (!value.trim()) return true
                      if (!PRICE_PATTERN.test(value.trim())) {
                        return t('products.new.errors.discountPriceInvalid')
                      }
                      const regularPrice = Number(getValues('regularPrice'))
                      if (Number.isNaN(regularPrice)) return true
                      return (
                        Number(value) < regularPrice ||
                        t('products.new.errors.discountPriceTooHigh')
                      )
                    },
                  }}
                  render={({ field }) => (
                    <NumberField
                      fullWidth
                      minValue={0}
                      step={0.01}
                      formatOptions={{ maximumFractionDigits: 2 }}
                      value={field.value.trim() === '' ? Number.NaN : Number(field.value)}
                      onChange={(value) => {
                        field.onChange(toPriceInputValue(value))
                      }}
                      aria-label={t('products.new.sections.inventory.discountPrice')}
                    >
                      <NumberField.Group className="flex h-11 items-center rounded-lg border border-field-border bg-surface-soft px-3">
                        <NumberField.Input
                          placeholder={t(
                            'products.new.sections.inventory.discountPricePlaceholder',
                          )}
                          className="w-full bg-transparent text-sm text-accent outline-none placeholder:text-accent/45"
                        />
                      </NumberField.Group>
                    </NumberField>
                  )}
                />
                {errors.discountPrice ? (
                  <p className="text-xs text-danger">{errors.discountPrice.message}</p>
                ) : null}
              </div>
            </div>

            <div className="flex w-full gap-5">
              <div className="flex flex-1 flex-col gap-2">
                <FieldLabel required>
                  {t('products.new.sections.inventory.stock')}
                </FieldLabel>
                <Controller
                  control={control}
                  name="stockQuantity"
                  rules={{
                    validate: (value) => {
                      if (typeof value !== 'number' || Number.isNaN(value)) {
                        return t('products.new.errors.stockRequired')
                      }
                      return value >= 0 || t('products.new.errors.stockInvalid')
                    },
                  }}
                  render={({ field }) => (
                    <NumberField
                      fullWidth
                      minValue={0}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <NumberField.Group className="flex h-11 items-center rounded-lg border border-field-border bg-surface-soft px-3">
                        <NumberField.Input className="w-full bg-transparent text-sm text-accent outline-none" />
                      </NumberField.Group>
                    </NumberField>
                  )}
                />
                {errors.stockQuantity ? (
                  <p className="text-xs text-danger">{errors.stockQuantity.message}</p>
                ) : null}
              </div>

              <TextField name="sku" className="flex flex-1 flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('products.new.sections.inventory.sku')}
                </Label>
                <Input
                  fullWidth
                  className={textInputClassName}
                  placeholder={t('products.new.sections.inventory.skuPlaceholder')}
                  {...register('sku')}
                />
              </TextField>
            </div>
            <p className="text-[13px] text-accent/70">
              {t('products.new.sections.inventory.hint')}
            </p>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.badges.title')}</CardTitle>
            <I18nProvider locale={locale === 'ru' ? 'ru-RU' : 'ro-RO'}>
              <div className="flex w-full gap-5">
                <div className="flex flex-1 flex-col gap-2">
                  <DiscountDateField
                    control={control}
                    name="discountStartAt"
                    label={t('products.new.sections.badges.discountStart')}
                    onValueChange={() => {
                      if (getValues('discountEndAt')) void trigger('discountEndAt')
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <DiscountDateField
                    control={control}
                    name="discountEndAt"
                    label={t('products.new.sections.badges.discountEnd')}
                    isInvalid={!!errors.discountEndAt}
                    rules={{
                      validate: (value) => {
                        const start = getValues('discountStartAt')
                        if (!value || !start) return true
                        return (
                          value >= start || t('products.new.errors.discountPeriodInvalid')
                        )
                      },
                    }}
                  />
                  {errors.discountEndAt ? (
                    <p className="text-xs text-danger">{errors.discountEndAt.message}</p>
                  ) : null}
                </div>
              </div>
            </I18nProvider>
            <Controller
              control={control}
              name="isNewBadgeEnabled"
              render={({ field }) => (
                <div className="flex w-full items-center justify-between">
                  <p className="text-sm font-medium text-accent">
                    {t('products.new.sections.categoryStatus.newBadge')}
                  </p>
                  <Switch isSelected={field.value} onChange={field.onChange} />
                </div>
              )}
            />
          </Card>
        </div>

        <div className="flex w-[420px] shrink-0 flex-col gap-6">
          <Card>
            <CardTitle>{t('products.new.sections.categoryStatus.title')}</CardTitle>

            <div className="flex w-full flex-col gap-2">
              <FieldLabel required>
                {t('products.new.sections.categoryStatus.mainCategory')}
              </FieldLabel>
              <Controller
                control={control}
                name="mainCategoryId"
                rules={{ required: t('products.new.errors.categoryRequired') }}
                render={({ field }) => (
                  <Select
                    selectedKey={field.value || null}
                    onSelectionChange={(key) => field.onChange(key ? String(key) : '')}
                    aria-label={t('products.new.sections.categoryStatus.mainCategory')}
                  >
                    <Select.Trigger className={selectTriggerClassName}>
                      <span className="text-sm font-medium text-accent">
                        {categories.find((category) => category.id === field.value)?.name
                          .ro ??
                          t('products.new.sections.categoryStatus.mainCategoryPlaceholder')}
                      </span>
                      <Select.Indicator className="size-4 shrink-0 text-accent">
                        <use href="/icons.svg#chevron-down-icon" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover className={selectPopoverClassName}>
                      <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                        {categories.map((category) => (
                          <ListBox.Item
                            key={category.id}
                            id={category.id}
                            textValue={category.name.ro}
                            className={selectOptionClassName}
                          >
                            {category.name.ro} / {category.name.ru}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              />
              {errors.mainCategoryId ? (
                <p className="text-xs text-danger">{errors.mainCategoryId.message}</p>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label className="text-sm font-semibold text-accent">
                {t('products.new.sections.categoryStatus.additionalCategories')}
              </Label>
              <Controller
                control={control}
                name="additionalCategoryIds"
                render={({ field }) => {
                  const selectedKeys = new Set(field.value)
                  const selectedLabel = categories
                    .filter((category) => selectedKeys.has(category.id))
                    .map((category) => category.name.ro)
                    .join(', ')
                  return (
                    <Dropdown>
                      <Dropdown.Trigger>
                        <button
                          type="button"
                          className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-field-border bg-surface-soft px-4"
                        >
                          <span className="truncate text-sm font-medium text-accent">
                            {selectedLabel ||
                              t(
                                'products.new.sections.categoryStatus.additionalCategoriesPlaceholder',
                              )}
                          </span>
                          <svg className="size-4 shrink-0 text-accent" aria-hidden="true">
                            <use href="/icons.svg#chevron-down-icon" />
                          </svg>
                        </button>
                      </Dropdown.Trigger>
                      <Dropdown.Popover className={selectPopoverClassName}>
                        <Dropdown.Menu
                          selectionMode="multiple"
                          selectedKeys={selectedKeys}
                          onSelectionChange={(keys) => {
                            field.onChange(Array.from(keys as Set<string>))
                          }}
                          className="bg-transparent! p-0! outline-none!"
                        >
                          {categories.map((category) => (
                            <Dropdown.Item
                              key={category.id}
                              id={category.id}
                              textValue={category.name.ro}
                              className={selectOptionClassName}
                            >
                              {category.name.ro} / {category.name.ru}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  )
                }}
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <FieldLabel required>
                {t('products.new.sections.categoryStatus.status')}
              </FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    selectedKey={field.value}
                    onSelectionChange={(key) => field.onChange(String(key))}
                    aria-label={t('products.new.sections.categoryStatus.status')}
                  >
                    <Select.Trigger className={selectTriggerClassName}>
                      <span className="text-sm font-medium text-accent">
                        {statusOptions.find((option) => option.id === field.value)?.label}
                      </span>
                      <Select.Indicator className="size-4 shrink-0 text-accent">
                        <use href="/icons.svg#chevron-down-icon" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover className={selectPopoverClassName}>
                      <ListBox className="bg-transparent! p-0! outline-none!">
                        {statusOptions.map((option) => (
                          <ListBox.Item
                            key={option.id}
                            id={option.id}
                            textValue={option.label}
                            className={selectOptionClassName}
                          >
                            {option.label}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              />
            </div>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.characteristics.title')}</CardTitle>
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full items-center justify-between gap-3">
                <Label className="text-sm font-semibold text-accent">
                  {t('products.new.sections.characteristics.unitOfSale')}
                </Label>
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(true)}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {t('unitsOfSale.createInline')}
                </button>
              </div>
              <Controller
                control={control}
                name="unitOfSaleId"
                render={({ field }) => {
                  const unitLabel = (unit: UnitOfSale) =>
                    unit.isActive
                      ? unit.name[locale]
                      : `${unit.name[locale]} ${t('unitsOfSale.disabledSuffix')}`
                  const selectableUnits = unitsOfSale.filter(
                    (unit) => unit.isActive || unit.id === field.value,
                  )
                  const selectedUnit = unitsOfSale.find((unit) => unit.id === field.value)

                  return (
                    <Select
                      selectedKey={field.value || null}
                      onSelectionChange={(key) => field.onChange(key ? String(key) : '')}
                      aria-label={t('products.new.sections.characteristics.unitOfSale')}
                    >
                      <Select.Trigger className={selectTriggerClassName}>
                        <span className="text-sm font-medium text-accent">
                          {selectedUnit
                            ? unitLabel(selectedUnit)
                            : t('products.new.sections.characteristics.unitOfSalePlaceholder')}
                        </span>
                        <Select.Indicator className="size-4 shrink-0 text-accent">
                          <use href="/icons.svg#chevron-down-icon" />
                        </Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover className={selectPopoverClassName}>
                        <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                          {selectableUnits.map((unit) => (
                            <ListBox.Item
                              key={unit.id}
                              id={unit.id}
                              textValue={unitLabel(unit)}
                              className={selectOptionClassName}
                            >
                              {unitLabel(unit)}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )
                }}
              />
              <UnitOfSaleModal
                isOpen={isUnitModalOpen}
                unit={null}
                defaultSortOrder={unitsOfSale.reduce(
                  (max, unit) => Math.max(max, unit.sortOrder + 1),
                  0,
                )}
                onClose={() => setIsUnitModalOpen(false)}
                onSaved={(unit) => {
                  setUnitsOfSale((prev) => [...prev, unit])
                  if (unit.isActive) setValue('unitOfSaleId', unit.id, { shouldDirty: true })
                }}
              />
            </div>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.seo.title')}</CardTitle>
            <LangTabs value={seoLang} onChange={setSeoLang} />

            <LangPanel langKey={seoLang}>
              <TextField
                name={seoLang === 'ro' ? 'seoTitleRo' : 'seoTitleRu'}
                isInvalid={seoLang === 'ro' ? !!errors.seoTitleRo : !!errors.seoTitleRu}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>{t('products.new.sections.seo.seoTitle')}</FieldLabel>
                {seoLang === 'ro' ? (
                  <ControlledInput
                    control={control}
                    name="seoTitleRo"
                    placeholder={t('products.new.sections.seo.seoTitlePlaceholderRo')}
                    rules={{
                      maxLength: 70,
                    }}
                  />
                ) : (
                  <ControlledInput
                    control={control}
                    name="seoTitleRu"
                    placeholder={t('products.new.sections.seo.seoTitlePlaceholderRu')}
                    rules={{
                      maxLength: 70,
                    }}
                  />
                )}
                <FieldError />
              </TextField>

              <TextField
                name={seoLang === 'ro' ? 'metaDescriptionRo' : 'metaDescriptionRu'}
                isInvalid={
                  seoLang === 'ro' ? !!errors.metaDescriptionRo : !!errors.metaDescriptionRu
                }
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>
                  {t('products.new.sections.seo.metaDescription')}
                </FieldLabel>
                {seoLang === 'ro' ? (
                  <ControlledTextArea
                    control={control}
                    name="metaDescriptionRo"
                    rows={4}
                    placeholder={t(
                      'products.new.sections.seo.metaDescriptionPlaceholderRo',
                    )}
                    rules={{
                      maxLength: 160,
                    }}
                  />
                ) : (
                  <ControlledTextArea
                    control={control}
                    name="metaDescriptionRu"
                    rows={4}
                    placeholder={t(
                      'products.new.sections.seo.metaDescriptionPlaceholderRu',
                    )}
                    rules={{
                      maxLength: 160,
                    }}
                  />
                )}
                <FieldError />
              </TextField>

              <TextField
                name={seoLang === 'ro' ? 'slugRo' : 'slugRu'}
                isInvalid={seoLang === 'ro' ? !!errors.slugRo : !!errors.slugRu}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel required>{t('products.new.sections.seo.slug')}</FieldLabel>
                {seoLang === 'ro' ? (
                  <ControlledInput
                    control={control}
                    name="slugRo"
                    rules={{
                      validate: (value) => {
                        if (typeof value !== 'string' || !value.trim()) return true
                        return (
                          SLUG_PATTERN.test(value) || t('products.new.errors.slugInvalid')
                        )
                      },
                    }}
                  />
                ) : (
                  <ControlledInput
                    control={control}
                    name="slugRu"
                    rules={{
                      validate: (value) => {
                        if (typeof value !== 'string' || !value.trim()) return true
                        return (
                          SLUG_PATTERN.test(value) || t('products.new.errors.slugInvalid')
                        )
                      },
                    }}
                  />
                )}
                <FieldError />
                <p className="text-xs text-accent/60">
                  {t('products.new.sections.seo.slugHint')}
                </p>
              </TextField>
            </LangPanel>
          </Card>

          <Card>
            <CardTitle>{t('products.new.sections.readiness.title')}</CardTitle>
            <div className="flex w-full flex-col gap-3">
              <CheckItem
                met={readiness.nameAndSlug}
                label={t('products.new.sections.readiness.nameAndSlug')}
              />
              <CheckItem
                met={readiness.shortDescription}
                label={t('products.new.sections.readiness.shortDescription')}
              />
              <CheckItem
                met={readiness.mainCategory}
                label={t('products.new.sections.readiness.mainCategory')}
              />
              <CheckItem
                met={readiness.unitOfSale}
                label={t('products.new.sections.readiness.unitOfSale')}
              />
              <CheckItem
                met={readiness.mainImage}
                label={t('products.new.sections.readiness.mainImage')}
              />
              <CheckItem
                met={readiness.seo}
                label={t('products.new.sections.readiness.seo')}
              />
              <CheckItem
                met={readiness.priceAndStock}
                label={t('products.new.sections.readiness.priceAndStock')}
              />
            </div>

            {!canPublish ? (
              <div className="flex w-full flex-col gap-2 rounded-[10px] border border-[#f3d08a] bg-[#fff4d6] p-4">
                <p className="text-sm font-bold text-accent">
                  {t('products.new.sections.readiness.blockedTitle')}
                </p>
                <p className="text-[13px] text-accent">
                  {t('products.new.sections.readiness.blockedHint')}
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </Form>
  )
}
