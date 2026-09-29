import { Button, ListBox, Modal, Select } from '@heroui/react'
import { useEffect, useState } from 'react'
import { listCategorySummariesUseCase } from '../../../application/categories/list-category-summaries.use-case'
import { listProductsUseCase } from '../../../application/products/list-products.use-case'
import type { TrashItem } from '../../../domain/trash/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { productsApi } from '../../../infrastructure/products/products.api'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface PermanentDeleteModalProps {
  item: TrashItem | null
  locale: Locale
  isPending: boolean
  onClose: () => void
  onConfirm: (item: TrashItem, redirectTargetId?: string) => void
}

interface RedirectOption {
  id: string
  label: string
}

const NO_REDIRECT_KEY = '__none__'

export function PermanentDeleteModal({
  item,
  locale,
  isPending,
  onClose,
  onConfirm,
}: PermanentDeleteModalProps) {
  const { t } = useTranslation()
  const [options, setOptions] = useState<RedirectOption[]>([])
  const [targetId, setTargetId] = useState('')

  const needsRedirect = item?.statusBeforeTrash === 'published'
  const itemId = item?.id
  const itemType = item?.type

  useEffect(() => {
    setTargetId('')
    setOptions([])
    if (!itemId || !itemType || !needsRedirect) return

    let cancelled = false
    const request =
      itemType === 'product'
        ? listProductsUseCase(productsApi, { status: 'published' }).then((products) =>
            products.map((product) => ({ id: product.id, label: product.name[locale] })),
          )
        : listCategorySummariesUseCase(categoriesApi).then((categories) =>
            categories.map((category) => ({ id: category.id, label: category.name[locale] })),
          )

    void request
      .then((list) => {
        if (!cancelled) setOptions(list.filter((option) => option.id !== itemId))
      })
      .catch(() => {
        if (!cancelled) setOptions([])
      })

    return () => {
      cancelled = true
    }
  }, [itemId, itemType, needsRedirect, locale])

  const selectedLabel = options.find((option) => option.id === targetId)?.label

  return (
    <Modal.Backdrop
      isOpen={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          {item ? (
            <>
              <Modal.Header>
                <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                  {t('trash.permanentDelete.title')}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4 pt-4">
                <p className="text-sm text-ink">
                  {t('trash.permanentDelete.confirm', { name: item.name[locale] })}
                </p>
                {needsRedirect ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-semibold text-accent">
                      {t('trash.permanentDelete.redirectLabel')}
                    </p>
                    <Select
                      selectedKey={targetId || NO_REDIRECT_KEY}
                      onSelectionChange={(key) =>
                        setTargetId(key && key !== NO_REDIRECT_KEY ? String(key) : '')
                      }
                      aria-label={t('trash.permanentDelete.redirectLabel')}
                    >
                      <Select.Trigger className="flex! h-11! w-full! items-center! justify-between! gap-2! rounded-md! border! border-field-border! bg-white! px-3! shadow-none!">
                        <span className={targetId ? 'text-sm text-accent' : 'text-sm text-muted'}>
                          {selectedLabel ?? t('trash.permanentDelete.redirectNone')}
                        </span>
                        <Select.Indicator className="size-4 shrink-0 text-accent">
                          <use href="/icons.svg#chevron-down-icon" />
                        </Select.Indicator>
                      </Select.Trigger>
                      <Select.Popover className="rounded-md! border! border-field-border! bg-[#eef2df]! p-1! shadow-none!">
                        <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                          <ListBox.Item
                            id={NO_REDIRECT_KEY}
                            textValue={t('trash.permanentDelete.redirectNone')}
                            className="min-h-0! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! text-accent! shadow-none! outline-none! data-[focused=true]:bg-accent/10! data-[hovered=true]:bg-accent/10! data-[selected=true]:bg-accent/15!"
                          >
                            {t('trash.permanentDelete.redirectNone')}
                          </ListBox.Item>
                          {options.map((option) => (
                            <ListBox.Item
                              key={option.id}
                              id={option.id}
                              textValue={option.label}
                              className="min-h-0! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! text-accent! shadow-none! outline-none! data-[focused=true]:bg-accent/10! data-[hovered=true]:bg-accent/10! data-[selected=true]:bg-accent/15!"
                            >
                              {option.label}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <p className="text-xs text-muted">{t('trash.permanentDelete.redirectHint')}</p>
                  </div>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  isDisabled={isPending}
                  onPress={onClose}
                  className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  isDisabled={isPending}
                  onPress={() => onConfirm(item, targetId || undefined)}
                  className="h-9! rounded-md! bg-danger! px-4! text-sm! font-semibold! text-white! shadow-none!"
                >
                  {t('trash.actions.permanentDelete')}
                </Button>
              </Modal.Footer>
            </>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
