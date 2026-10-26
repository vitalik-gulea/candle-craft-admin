import { Button, Input, Label, ListBox, Modal, Select, TextField } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { listCategoryTreeUseCase } from '../../../application/categories/list-category-tree.use-case'
import type { CategoryTreeNode } from '../../../domain/categories/types'
import type { NavigationItem } from '../../../domain/navigation/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { useTranslation } from '../../../shared/i18n'
import { useNavigationStore } from '../../stores/navigation.store'

interface NavigationItemModalProps {
  isOpen: boolean
  item: NavigationItem | null
  onClose: () => void
}

interface NavigationItemFormValues {
  labelRo: string
  labelRu: string
  url: string
}

interface CategoryOption {
  id: string
  depth: number
  nameRo: string
  nameRu: string
  path: string
}

const LABEL_MAX_LENGTH = 100
const URL_MAX_LENGTH = 2000
const URL_PATTERN = /^(\/(?!\/)\S*|https?:\/\/\S+)$/

const selectTriggerClassName =
  'flex! h-11! w-full! items-center! justify-between! gap-2! rounded-lg! border! border-field-border! bg-surface-soft! px-4! shadow-none!'
const selectPopoverClassName =
  'rounded-md! border! border-field-border! bg-[#eef2df]! p-1! shadow-none!'
const selectOptionClassName =
  'min-h-0! w-full! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! leading-[18px]! text-accent! shadow-none! outline-none! data-[focused=true]:bg-accent/10! data-[hovered=true]:bg-accent/10! data-[selected=true]:bg-accent/15!'

function toCategoryOptions(nodes: CategoryTreeNode[], depth = 1): CategoryOption[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      depth,
      nameRo: node.name.ro,
      nameRu: node.name.ru,
      path: `/shop/category/${node.slug.ru}`,
    },
    ...toCategoryOptions(node.children, depth + 1),
  ])
}

function toFormValues(item: NavigationItem | null): NavigationItemFormValues {
  return {
    labelRo: item?.label.ro ?? '',
    labelRu: item?.label.ru ?? '',
    url: item?.url ?? '',
  }
}

export function NavigationItemModal({ isOpen, item, onClose }: NavigationItemModalProps) {
  const { t, locale } = useTranslation()
  const create = useNavigationStore((state) => state.create)
  const update = useNavigationStore((state) => state.update)
  const isMutating = useNavigationStore((state) => state.isMutating)
  const errorCode = useNavigationStore((state) => state.errorCode)
  const errorDetails = useNavigationStore((state) => state.errorDetails)
  const clearError = useNavigationStore((state) => state.clearError)

  const [categories, setCategories] = useState<CategoryOption[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NavigationItemFormValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(item),
  })

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset(toFormValues(item))
  }, [isOpen, item, reset, clearError])

  useEffect(() => {
    if (!isOpen || categories.length > 0) return
    void listCategoryTreeUseCase(categoriesApi)
      .then((tree) => setCategories(toCategoryOptions(tree)))
      .catch(() => setCategories([]))
  }, [isOpen, categories.length])

  const url = watch('url')
  const selectedCategory = useMemo(
    () => categories.find((category) => category.path === url.trim()) ?? null,
    [categories, url],
  )

  const labelRules = {
    validate: (value: string) => value.trim().length > 0 || t('navigation.errors.required'),
    maxLength: { value: LABEL_MAX_LENGTH, message: t('navigation.errors.maxLength') },
  }

  const serverDetails = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails
  const serverError =
    errorCode === 'VALIDATION'
      ? serverDetails || t('navigation.errors.validation')
      : errorCode === 'NOT_FOUND'
        ? t('navigation.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('navigation.errors.forbidden')
          : errorCode
            ? t('navigation.errors.unknown')
            : null

  const onSubmit = handleSubmit(async (values) => {
    const input = {
      label: { ro: values.labelRo.trim(), ru: values.labelRu.trim() },
      url: values.url.trim(),
    }
    const saved = item ? await update(item.id, input) : await create(input)
    if (saved) onClose()
  })

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          <form onSubmit={onSubmit} noValidate className="flex flex-col">
            <Modal.Header>
              <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                {item ? t('navigation.modal.editTitle') : t('navigation.modal.createTitle')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

              <TextField
                name="labelRo"
                isInvalid={!!errors.labelRo}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('navigation.modal.labelRo')}
                </Label>
                <Input fullWidth autoFocus placeholder="Ceară" {...register('labelRo', labelRules)} />
                {errors.labelRo ? (
                  <p className="text-xs text-danger">{errors.labelRo.message}</p>
                ) : null}
              </TextField>

              <TextField
                name="labelRu"
                isInvalid={!!errors.labelRu}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('navigation.modal.labelRu')}
                </Label>
                <Input fullWidth placeholder="Воск" {...register('labelRu', labelRules)} />
                {errors.labelRu ? (
                  <p className="text-xs text-danger">{errors.labelRu.message}</p>
                ) : null}
              </TextField>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('navigation.modal.pickCategory')}
                </Label>
                <Select
                  selectedKey={selectedCategory?.id ?? null}
                  onSelectionChange={(key) => {
                    const category = categories.find((option) => option.id === String(key))
                    if (category) {
                      setValue('url', category.path, { shouldDirty: true, shouldValidate: true })
                    }
                  }}
                  aria-label={t('navigation.modal.pickCategory')}
                >
                  <Select.Trigger className={selectTriggerClassName}>
                    <span className="text-sm font-medium text-accent">
                      {selectedCategory
                        ? locale === 'ro'
                          ? selectedCategory.nameRo
                          : selectedCategory.nameRu
                        : t('navigation.modal.pickCategoryPlaceholder')}
                    </span>
                    <Select.Indicator className="size-4 shrink-0 text-accent">
                      <use href="#chevron-down-icon" />
                    </Select.Indicator>
                  </Select.Trigger>
                  <Select.Popover className={selectPopoverClassName}>
                    <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                      {categories.map((category) => (
                        <ListBox.Item
                          key={category.id}
                          id={category.id}
                          textValue={locale === 'ro' ? category.nameRo : category.nameRu}
                          className={selectOptionClassName}
                        >
                          <span style={{ paddingInlineStart: (category.depth - 1) * 16 }}>
                            {locale === 'ro' ? category.nameRo : category.nameRu}
                          </span>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <Controller
                control={control}
                name="url"
                rules={{
                  validate: (value) => {
                    const trimmed = value.trim()
                    if (!trimmed) return t('navigation.errors.required')
                    return URL_PATTERN.test(trimmed) || t('navigation.errors.url')
                  },
                  maxLength: { value: URL_MAX_LENGTH, message: t('navigation.errors.maxLength') },
                }}
                render={({ field }) => (
                  <TextField name={field.name} isInvalid={!!errors.url} className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold text-accent">
                      {t('navigation.modal.url')}
                    </Label>
                    <Input
                      fullWidth
                      placeholder="/shop  ·  https://"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    {errors.url ? (
                      <p className="text-xs text-danger">{errors.url.message}</p>
                    ) : (
                      <p className="text-xs leading-snug text-muted">
                        {t('navigation.modal.urlHint')}
                      </p>
                    )}
                  </TextField>
                )}
              />
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                isDisabled={isMutating}
                onPress={onClose}
                className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                isDisabled={isMutating}
                className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
              >
                {t('common.save')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
