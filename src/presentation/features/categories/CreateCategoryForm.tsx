import {
  Alert,
  Button,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextArea,
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type Path,
  type RegisterOptions,
} from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { listCategorySummariesUseCase } from '../../../application/categories/list-category-summaries.use-case'
import { replaceCategoryFaqUseCase } from '../../../application/categories/replace-category-faq.use-case'
import { uploadImageUseCase } from '../../../application/uploads/upload-image.use-case'
import type { Category, CategoryStatus, CategorySummary } from '../../../domain/categories/types'
import type { UploadedImage } from '../../../domain/uploads/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { uploadsApi } from '../../../infrastructure/uploads/uploads.api'
import { useTranslation } from '../../../shared/i18n'
import { slugify } from '../../../shared/utils/slugify'
import { useCategoriesStore } from '../../stores/categories.store'

type Lang = 'ro' | 'ru'

interface FaqValues {
  questionRo: string
  questionRu: string
  answerRo: string
  answerRu: string
}

interface CreateCategoryValues {
  nameRo: string
  nameRu: string
  slugRo: string
  slugRu: string
  parentId: string
  altRo: string
  altRu: string
  descriptionRo: string
  descriptionRu: string
  seoTitleRo: string
  seoTitleRu: string
  metaDescriptionRo: string
  metaDescriptionRu: string
  status: CategoryStatus
  showInCatalog: boolean
  showInNavigation: boolean
  showOnHomepage: boolean
  homepageOrder: string
  showSubcategoryProducts: boolean
  faq: FaqValues[]
}

const DEFAULT_VALUES: CreateCategoryValues = {
  nameRo: '',
  nameRu: '',
  slugRo: '',
  slugRu: '',
  parentId: '',
  altRo: '',
  altRu: '',
  descriptionRo: '',
  descriptionRu: '',
  seoTitleRo: '',
  seoTitleRu: '',
  metaDescriptionRo: '',
  metaDescriptionRu: '',
  status: 'draft',
  showInCatalog: true,
  showInNavigation: true,
  showOnHomepage: false,
  homepageOrder: '0',
  showSubcategoryProducts: false,
  faq: [],
}

function toFormValues(category?: Category): CreateCategoryValues {
  if (!category) return DEFAULT_VALUES
  return {
    nameRo: category.name.ro,
    nameRu: category.name.ru,
    slugRo: category.slug.ro,
    slugRu: category.slug.ru,
    parentId: category.parentId ?? '',
    altRo: category.alt.ro ?? '',
    altRu: category.alt.ru ?? '',
    descriptionRo: category.description.ro ?? '',
    descriptionRu: category.description.ru ?? '',
    seoTitleRo: category.seoTitle.ro ?? '',
    seoTitleRu: category.seoTitle.ru ?? '',
    metaDescriptionRo: category.metaDescription.ro ?? '',
    metaDescriptionRu: category.metaDescription.ru ?? '',
    status: category.status,
    showInCatalog: category.showInCatalog,
    showInNavigation: category.showInNavigation,
    showOnHomepage: category.showOnHomepage,
    homepageOrder: String(category.homepageOrder),
    showSubcategoryProducts: category.showSubcategoryProducts,
    faq: [],
  }
}

const EMPTY_FAQ: FaqValues = { questionRo: '', questionRu: '', answerRo: '', answerRu: '' }
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const NO_PARENT_KEY = '__none__'

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

function CardHeader({
  title,
  hint,
  badge,
}: {
  title: string
  hint?: string
  badge?: string
}) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-heading text-xl font-bold text-accent">{title}</p>
        {hint ? <p className="text-[13px] leading-snug text-muted">{hint}</p> : null}
      </div>
      {badge ? (
        <span className="rounded-md bg-surface-soft px-2 py-1 text-[11px] font-semibold text-muted">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

function LangTabs({ value, onChange }: { value: Lang; onChange: (lang: Lang) => void }) {
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

function LangPanel({ langKey, children }: { langKey: Lang; children: React.ReactNode }) {
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

function FieldShell({
  label,
  required,
  hint,
  error,
  counter,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <Label className="text-[13px] font-semibold text-accent">
          {label}
          {required ? ' *' : ''}
        </Label>
        {counter ? <span className="text-xs text-muted">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-snug text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

function ControlledInput({
  control,
  name,
  rules,
  placeholder,
  onValueChange,
}: {
  control: Control<CreateCategoryValues>
  name: Path<CreateCategoryValues>
  rules?: RegisterOptions<CreateCategoryValues, Path<CreateCategoryValues>>
  placeholder?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <Input
          fullWidth
          placeholder={placeholder}
          name={field.name}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={(event) => {
            field.onChange(event)
            onValueChange?.(event.target.value)
          }}
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
  placeholder,
  rows,
}: {
  control: Control<CreateCategoryValues>
  name: Path<CreateCategoryValues>
  placeholder?: string
  rows: number
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextArea
          fullWidth
          rows={rows}
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

function SwitchRow({
  control,
  name,
  label,
  hint,
}: {
  control: Control<CreateCategoryValues>
  name: 'showInCatalog' | 'showInNavigation' | 'showOnHomepage' | 'showSubcategoryProducts'
  label: string
  hint: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex w-full items-center gap-3">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-semibold text-accent">{label}</p>
            <p className="text-xs leading-snug text-muted">{hint}</p>
          </div>
          <Switch
            isSelected={field.value}
            onChange={field.onChange}
            aria-label={label}
          />
        </div>
      )}
    />
  )
}

function ReadinessItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex w-full items-start gap-2">
      <span
        className={
          met
            ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-accent'
            : 'mt-1.5 size-1.5 shrink-0 rounded-full bg-muted'
        }
      />
      <p className="flex-1 text-xs leading-snug text-accent/80">{label}</p>
    </div>
  )
}

function firstErrorLang(errors: FieldErrors<CreateCategoryValues>): Lang | null {
  if (errors.nameRo || errors.slugRo) return 'ro'
  if (errors.nameRu || errors.slugRu) return 'ru'
  return null
}

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'CONFLICT') return t('categories.errors.conflict')
  if (code === 'VALIDATION') return t('categories.errors.validation')
  if (code === 'NOT_FOUND') return t('categories.errors.notFound')
  return t('categories.errors.unknown')
}

export function CreateCategoryForm({ category }: { category?: Category }) {
  const isEditing = category !== undefined
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const create = useCategoriesStore((state) => state.create)
  const update = useCategoriesStore((state) => state.update)
  const isMutating = useCategoriesStore((state) => state.isMutating)
  const errorCode = useCategoriesStore((state) => state.errorCode)
  const errorDetails = useCategoriesStore((state) => state.errorDetails)
  const clearError = useCategoriesStore((state) => state.clearError)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(category),
  })
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({ control, name: 'faq' })

  const [basicLang, setBasicLang] = useState<Lang>('ro')
  const [seoLang, setSeoLang] = useState<Lang>('ro')
  const [faqLang, setFaqLang] = useState<Lang>('ro')
  const [parents, setParents] = useState<CategorySummary[]>([])
  const [image, setImage] = useState<UploadedImage | null>(
    category?.imageUrl && category.imageKey
      ? { url: category.imageUrl, key: category.imageKey }
      : null,
  )
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const slugTouched = useRef<Record<Lang, boolean>>({ ro: isEditing, ru: isEditing })
  const createdId = useRef<string | null>(null)

  useEffect(() => {
    clearError()
    void listCategorySummariesUseCase(categoriesApi)
      .then((items) => setParents(items.filter((item) => item.id !== category?.id)))
      .catch(() => setParents([]))
  }, [clearError, category?.id])

  const values = watch()
  const seoTitleValue = seoLang === 'ro' ? values.seoTitleRo : values.seoTitleRu
  const metaValue = seoLang === 'ro' ? values.metaDescriptionRo : values.metaDescriptionRu
  const slugsValid = [values.slugRo, values.slugRu].every(
    (slug) => !slug || SLUG_PATTERN.test(slug),
  )
  const readiness = {
    name: values.nameRo.trim() !== '' && values.nameRu.trim() !== '',
    url: slugsValid && (values.slugRo !== '' || values.slugRu !== ''),
    image: image !== null && (values.altRo.trim() !== '' || values.altRu.trim() !== ''),
  }
  const isBusy = isMutating || isFinishing

  const statusOptions: { id: CategoryStatus; label: string }[] = [
    { id: 'draft', label: t('categories.status.draft') },
    { id: 'published', label: t('categories.status.published') },
  ]

  function handleNameChange(lang: Lang, value: string) {
    if (slugTouched.current[lang]) return
    setValue(lang === 'ro' ? 'slugRo' : 'slugRu', slugify(value), { shouldValidate: false })
  }

  async function handleUpload(file: File) {
    setLocalError(null)
    if (file.size > MAX_IMAGE_SIZE || !file.type.startsWith('image/')) {
      setLocalError(t('categories.errors.imageUploadFailed'))
      return
    }
    setIsUploading(true)
    try {
      setImage(await uploadImageUseCase(uploadsApi, file))
    } catch {
      setLocalError(t('categories.errors.imageUploadFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  async function submit(formValues: CreateCategoryValues, status: CategoryStatus) {
    setLocalError(null)
    clearError()

    const faqItems = formValues.faq.filter((item) =>
      [item.questionRo, item.questionRu, item.answerRo, item.answerRu].some(
        (value) => value.trim() !== '',
      ),
    )
    const isFaqComplete = faqItems.every((item) =>
      [item.questionRo, item.questionRu, item.answerRo, item.answerRu].every(
        (value) => value.trim() !== '',
      ),
    )
    if (!isFaqComplete) {
      setLocalError(t('categories.errors.faqIncomplete'))
      return
    }

    const orNull = (value: string) => (value.trim() === '' ? null : value.trim())

    if (category) {
      const updated = await update(category.id, {
        name: { ro: formValues.nameRo.trim(), ru: formValues.nameRu.trim() },
        parentId: formValues.parentId || null,
        slug: {
          ro: formValues.slugRo && formValues.slugRo !== category.slug.ro ? formValues.slugRo : undefined,
          ru: formValues.slugRu && formValues.slugRu !== category.slug.ru ? formValues.slugRu : undefined,
        },
        imageUrl: image?.url ?? null,
        imageKey: image?.key ?? null,
        alt: { ro: orNull(formValues.altRo), ru: orNull(formValues.altRu) },
        description: {
          ro: orNull(formValues.descriptionRo),
          ru: orNull(formValues.descriptionRu),
        },
        seoTitle: { ro: orNull(formValues.seoTitleRo), ru: orNull(formValues.seoTitleRu) },
        metaDescription: {
          ro: orNull(formValues.metaDescriptionRo),
          ru: orNull(formValues.metaDescriptionRu),
        },
        status: isEditing ? formValues.status : status,
        showInCatalog: formValues.showInCatalog,
        showInNavigation: formValues.showInNavigation,
        showOnHomepage: formValues.showOnHomepage,
        homepageOrder: Number(formValues.homepageOrder) || 0,
        showSubcategoryProducts: formValues.showSubcategoryProducts,
      })
      if (!updated) return
      createdId.current = category.id
    } else if (!createdId.current) {
      const category = await create({
        name: { ro: formValues.nameRo.trim(), ru: formValues.nameRu.trim() },
        parentId: formValues.parentId || undefined,
        slug: {
          ro: formValues.slugRo || undefined,
          ru: formValues.slugRu || undefined,
        },
        imageUrl: image?.url,
        imageKey: image?.key,
        alt: { ro: orNull(formValues.altRo), ru: orNull(formValues.altRu) },
        description: {
          ro: orNull(formValues.descriptionRo),
          ru: orNull(formValues.descriptionRu),
        },
        seoTitle: { ro: orNull(formValues.seoTitleRo), ru: orNull(formValues.seoTitleRu) },
        metaDescription: {
          ro: orNull(formValues.metaDescriptionRo),
          ru: orNull(formValues.metaDescriptionRu),
        },
        status,
        showInCatalog: formValues.showInCatalog,
        showInNavigation: formValues.showInNavigation,
        showOnHomepage: formValues.showOnHomepage,
        homepageOrder: Number(formValues.homepageOrder) || 0,
        showSubcategoryProducts: formValues.showSubcategoryProducts,
      })
      if (!category) return
      createdId.current = category.id
    }

    if (faqItems.length > 0) {
      setIsFinishing(true)
      try {
        await replaceCategoryFaqUseCase(
          categoriesApi,
          createdId.current,
          faqItems.map((item) => ({
            question: { ro: item.questionRo.trim(), ru: item.questionRu.trim() },
            answer: { ro: item.answerRo.trim(), ru: item.answerRu.trim() },
          })),
        )
      } catch {
        setLocalError(t('categories.errors.faqFailed'))
        return
      } finally {
        setIsFinishing(false)
      }
    }

    navigate('/categories')
  }

  function onInvalid(formErrors: FieldErrors<CreateCategoryValues>) {
    const lang = firstErrorLang(formErrors)
    if (lang) setBasicLang(lang)
  }

  const submitAs = (status: CategoryStatus) =>
    handleSubmit((formValues) => submit(formValues, status), onInvalid)

  const apiErrorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails
  const alertTitle = localError ?? apiErrorMessage

  const nameKey = basicLang === 'ro' ? 'nameRo' : 'nameRu'
  const slugKey = basicLang === 'ro' ? 'slugRo' : 'slugRu'
  const altKey = basicLang === 'ro' ? 'altRo' : 'altRu'
  const descriptionKey = basicLang === 'ro' ? 'descriptionRo' : 'descriptionRu'
  const seoTitleKey = seoLang === 'ro' ? 'seoTitleRo' : 'seoTitleRu'
  const metaKey = seoLang === 'ro' ? 'metaDescriptionRo' : 'metaDescriptionRu'

  return (
    <Form
      validationBehavior="aria"
      onSubmit={(event) => {
        event.preventDefault()
        void submitAs('draft')()
      }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">{t('categories.breadcrumbManagement')}</p>
            <svg className="size-3 text-muted" aria-hidden="true">
              <use href="/icons.svg#chevron-right-icon" />
            </svg>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="text-sm text-muted hover:text-accent"
            >
              {t('nav.categories')}
            </button>
            <svg className="size-3 text-muted" aria-hidden="true">
              <use href="/icons.svg#chevron-right-icon" />
            </svg>
            <p className="text-sm font-medium text-accent">
              {isEditing ? t('categories.editTitle') : t('categories.createTitle')}
            </p>
          </div>
          <h1 className="font-heading text-[32px] font-bold text-accent">
            {isEditing ? t('categories.editTitle') : t('categories.createTitle')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isEditing ? (
            <Button
              type="button"
              isPending={isBusy}
              isDisabled={isBusy || !readiness.name}
              onPress={() => void submitAs(values.status)()}
              className="rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white disabled:bg-surface-soft disabled:text-accent/45"
            >
              {t('common.save')}
            </Button>
          ) : (
            <>
          <Button
            type="button"
            variant="secondary"
            isPending={isBusy}
            isDisabled={isBusy}
            onPress={() => void submitAs('draft')()}
            className="rounded-lg border border-accent bg-white px-6 py-3 text-[15px] font-semibold text-accent"
          >
            {t('categories.new.saveDraft')}
          </Button>
          <Button
            type="button"
            isPending={isBusy}
            isDisabled={isBusy || !readiness.name}
            onPress={() => void submitAs('published')()}
            className="rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white disabled:bg-surface-soft disabled:text-accent/45"
          >
            {t('categories.new.publish')}
          </Button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {alertTitle ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{alertTitle}</Alert.Title>
                {!localError && detailsText ? (
                  <Alert.Description>{detailsText}</Alert.Description>
                ) : null}
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex w-full items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card>
            <CardHeader
              title={t('categories.new.basic.title')}
              hint={t('categories.new.basic.hint')}
            />
            <LangTabs value={basicLang} onChange={setBasicLang} />

            <LangPanel langKey={basicLang}>
              <FieldShell
                label={t('categories.new.name')}
                required
                error={errors[nameKey]?.message}
              >
                <ControlledInput
                  control={control}
                  name={nameKey}
                  placeholder={
                    basicLang === 'ro'
                      ? t('categories.new.namePlaceholderRo')
                      : t('categories.new.namePlaceholderRu')
                  }
                  rules={{
                    required:
                      basicLang === 'ro'
                        ? t('categories.errors.nameRoRequired')
                        : t('categories.errors.nameRuRequired'),
                    validate: (value) =>
                      String(value).trim() !== '' ||
                      (basicLang === 'ro'
                        ? t('categories.errors.nameRoRequired')
                        : t('categories.errors.nameRuRequired')),
                  }}
                  onValueChange={(value) => handleNameChange(basicLang, value)}
                />
              </FieldShell>

              <FieldShell
                label={t('categories.new.url')}
                hint={t('categories.new.urlHint')}
                error={errors[slugKey]?.message}
              >
                <div className="flex h-11 w-full items-stretch overflow-hidden rounded-md border border-field-border bg-white">
                  <span className="flex items-center border-r border-field-border bg-surface-soft px-3 text-sm text-accent/70">
                    /catalog/
                  </span>
                  <Controller
                    control={control}
                    name={slugKey}
                    rules={{
                      validate: (value) =>
                        !value ||
                        SLUG_PATTERN.test(value) ||
                        t('categories.errors.slugInvalid'),
                    }}
                    render={({ field }) => (
                      <input
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        placeholder={t('categories.new.urlPlaceholder')}
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          slugTouched.current[basicLang] = event.target.value !== ''
                          field.onChange(event)
                        }}
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-accent outline-none placeholder:text-muted"
                      />
                    )}
                  />
                </div>
              </FieldShell>

              <FieldShell
                label={t('categories.new.parent')}
                hint={t('categories.new.parentHint')}
              >
                <Controller
                  control={control}
                  name="parentId"
                  render={({ field }) => (
                    <Select
                      selectedKey={field.value || NO_PARENT_KEY}
                      onSelectionChange={(key) =>
                        field.onChange(key && key !== NO_PARENT_KEY ? String(key) : '')
                      }
                      aria-label={t('categories.new.parent')}
                    >
                      <Select.Trigger className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-field-border bg-white px-3">
                        <span
                          className={
                            field.value
                              ? 'text-sm text-accent'
                              : 'text-sm text-muted'
                          }
                        >
                          {parents.find((parent) => parent.id === field.value)?.name[locale] ??
                            t('categories.new.parentNone')}
                        </span>
                        <Select.Indicator className="size-4 shrink-0 text-accent">
                          <use href="/icons.svg#chevron-down-icon" />
                        </Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox className="max-h-64 overflow-y-auto">
                          <ListBox.Item id={NO_PARENT_KEY} textValue={t('categories.new.parentNone')}>
                            {t('categories.new.parentNone')}
                          </ListBox.Item>
                          {parents.map((parent) => (
                            <ListBox.Item
                              key={parent.id}
                              id={parent.id}
                              textValue={parent.name[locale]}
                            >
                              {parent.name[locale]}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
              </FieldShell>

              <div className="flex w-full flex-col gap-2">
                <Label className="text-[13px] font-semibold text-accent">
                  {t('categories.new.image')}
                </Label>
                {image ? (
                  <div className="relative size-40 overflow-hidden rounded-lg border border-field-border">
                    <img src={image.url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-accent"
                      aria-label={t('categories.new.removeImage')}
                    >
                      <svg className="size-3" aria-hidden="true">
                        <use href="/icons.svg#x-icon" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault()
                      setIsDragging(false)
                      const file = event.dataTransfer.files?.[0]
                      if (file) void handleUpload(file)
                    }}
                    className={
                      isDragging
                        ? 'flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-accent bg-white px-6 py-8'
                        : 'flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-accent bg-surface-soft px-6 py-8'
                    }
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void handleUpload(file)
                        event.target.value = ''
                      }}
                    />
                    <svg className="size-6 text-accent" aria-hidden="true">
                      <use href="/icons.svg#upload-cloud-icon" />
                    </svg>
                    <p className="text-center text-[15px] font-semibold text-accent">
                      {isUploading
                        ? t('categories.new.uploading')
                        : t('categories.new.dropzoneTitle')}
                    </p>
                    <p className="text-center text-[13px] text-accent">
                      {t('categories.new.dropzoneHint')}
                    </p>
                  </label>
                )}
              </div>

              <FieldShell label={t('categories.new.alt')} hint={t('categories.new.altHint')}>
                <ControlledInput
                  control={control}
                  name={altKey}
                  placeholder={t('categories.new.altPlaceholder')}
                />
              </FieldShell>

              <FieldShell label={t('categories.new.description')}>
                <ControlledTextArea
                  control={control}
                  name={descriptionKey}
                  rows={5}
                  placeholder={t('categories.new.descriptionPlaceholder')}
                />
              </FieldShell>
            </LangPanel>
          </Card>

          <Card>
            <CardHeader title={t('categories.new.seo.title')} hint={t('categories.new.seo.hint')} />
            <LangTabs value={seoLang} onChange={setSeoLang} />
            <LangPanel langKey={seoLang}>
              <FieldShell
                label={t('categories.new.seo.seoTitle')}
                counter={`${seoTitleValue.length} / 60`}
              >
                <ControlledInput
                  control={control}
                  name={seoTitleKey}
                  placeholder={t('categories.new.seo.seoTitlePlaceholder')}
                />
              </FieldShell>
              <FieldShell
                label={t('categories.new.seo.metaDescription')}
                counter={`${metaValue.length} / 160`}
              >
                <ControlledTextArea
                  control={control}
                  name={metaKey}
                  rows={3}
                  placeholder={t('categories.new.seo.metaDescriptionPlaceholder')}
                />
              </FieldShell>
            </LangPanel>
          </Card>

          <Card>
            <CardHeader
              title={t('categories.new.faq.title')}
              hint={t('categories.new.faq.hint')}
              badge={t('categories.new.faq.optional')}
            />
            {faqFields.length > 0 ? <LangTabs value={faqLang} onChange={setFaqLang} /> : null}
            <AnimatePresence initial={false}>
              {faqFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex w-full items-start gap-3 rounded-lg border border-field-border bg-surface-soft p-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-3.5">
                    <FieldShell label={t('categories.new.faq.question')}>
                      <ControlledInput
                        control={control}
                        name={`faq.${index}.${faqLang === 'ro' ? 'questionRo' : 'questionRu'}`}
                        placeholder={t('categories.new.faq.questionPlaceholder')}
                      />
                    </FieldShell>
                    <FieldShell label={t('categories.new.faq.answer')}>
                      <ControlledTextArea
                        control={control}
                        name={`faq.${index}.${faqLang === 'ro' ? 'answerRo' : 'answerRu'}`}
                        rows={3}
                        placeholder={t('categories.new.faq.answerPlaceholder')}
                      />
                    </FieldShell>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-danger hover:bg-white"
                    aria-label={t('categories.new.faq.remove')}
                  >
                    <svg className="size-4" aria-hidden="true">
                      <use href="/icons.svg#trash-icon" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div>
              <Button
                type="button"
                variant="secondary"
                onPress={() => appendFaq(EMPTY_FAQ)}
                className="gap-2 rounded-md border border-field-border bg-white px-3.5 py-2 text-[13px] font-semibold text-accent"
              >
                <svg className="size-4" aria-hidden="true">
                  <use href="/icons.svg#plus-icon" />
                </svg>
                {t('categories.new.faq.add')}
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex w-80 shrink-0 flex-col gap-4">
          <Card>
            <p className="font-heading text-xl font-bold text-accent">
              {t('categories.new.visibility.title')}
            </p>
            <FieldShell label={t('categories.new.visibility.status')}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    selectedKey={field.value}
                    onSelectionChange={(key) => field.onChange(String(key) as CategoryStatus)}
                    aria-label={t('categories.new.visibility.status')}
                  >
                    <Select.Trigger className="flex h-11 w-full items-center gap-2 rounded-md border border-field-border bg-white px-3">
                      <span
                        className={
                          field.value === 'published'
                            ? 'size-2 shrink-0 rounded-full bg-accent'
                            : 'size-2 shrink-0 rounded-full bg-muted'
                        }
                      />
                      <span className="flex-1 text-left text-sm font-medium text-accent/80">
                        {statusOptions.find((option) => option.id === field.value)?.label}
                      </span>
                      <Select.Indicator className="size-4 shrink-0 text-accent">
                        <use href="/icons.svg#chevron-down-icon" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {statusOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                            {option.label}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              />
            </FieldShell>
            <div className="h-px w-full bg-field-border" />
            <div className="flex w-full flex-col gap-4">
              <SwitchRow
                control={control}
                name="showInCatalog"
                label={t('categories.new.visibility.catalog')}
                hint={t('categories.new.visibility.catalogHint')}
              />
              <SwitchRow
                control={control}
                name="showInNavigation"
                label={t('categories.new.visibility.navigation')}
                hint={t('categories.new.visibility.navigationHint')}
              />
              <SwitchRow
                control={control}
                name="showOnHomepage"
                label={t('categories.new.visibility.homepage')}
                hint={t('categories.new.visibility.homepageHint')}
              />
              <AnimatePresence initial={false}>
                {values.showOnHomepage ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <FieldShell label={t('categories.new.visibility.homepageOrder')}>
                      <Controller
                        control={control}
                        name="homepageOrder"
                        render={({ field }) => (
                          <Input
                            fullWidth
                            type="number"
                            min={0}
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                    </FieldShell>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <SwitchRow
                control={control}
                name="showSubcategoryProducts"
                label={t('categories.new.visibility.subcategories')}
                hint={t('categories.new.visibility.subcategoriesHint')}
              />
            </div>
          </Card>

          <div className="flex w-full flex-col gap-3.5 rounded-xl border border-muted/40 bg-surface-soft p-5">
            <p className="text-sm font-bold text-accent">{t('categories.new.readiness.title')}</p>
            <ReadinessItem met={readiness.name} label={t('categories.new.readiness.name')} />
            <ReadinessItem met={readiness.url} label={t('categories.new.readiness.url')} />
            <ReadinessItem met={readiness.image} label={t('categories.new.readiness.image')} />
          </div>
        </div>
      </div>
    </Form>
  )
}
