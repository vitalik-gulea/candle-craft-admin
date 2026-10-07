import { Alert, Button, NumberField, Spinner, Switch } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ProductVariant } from '../../../domain/product-variants/types'
import type { CharacteristicTypeValue } from '../../../domain/characteristic-types/types'
import { useTranslation } from '../../../shared/i18n'
import { useProductVariantsStore } from '../../stores/product-variants.store'
import { useCharacteristicTypesStore } from '../../stores/characteristic-types.store'
import { describeVariantError } from './product-variant-errors'
import { CharacteristicTypeModal } from '../characteristic-types/CharacteristicTypeModal'
import { CharacteristicTypeValueModal } from '../characteristic-types/CharacteristicTypeValueModal'
import { ProductVariantModal } from './ProductVariantModal'

interface ProductVariantsCardProps {
  productId?: string
}

interface InlineNumberCellProps {
  value: number | null
  label: string
  isDisabled: boolean
  isPrice?: boolean
  onCommit: (value: number) => Promise<boolean>
}

function InlineNumberCell({ value, label, isDisabled, isPrice, onCommit }: InlineNumberCellProps) {
  const [draft, setDraft] = useState<number>(value ?? Number.NaN)
  const [knownValue, setKnownValue] = useState(value)

  if (value !== knownValue) {
    setKnownValue(value)
    setDraft(value ?? Number.NaN)
  }

  function commit() {
    if (Number.isNaN(draft)) {
      setDraft(value ?? Number.NaN)
      return
    }
    if (draft === value) return
    void onCommit(draft).then((ok) => {
      if (!ok) setDraft(value ?? Number.NaN)
    })
  }

  return (
    <NumberField
      fullWidth
      minValue={0}
      step={isPrice ? 0.01 : 1}
      formatOptions={{ maximumFractionDigits: isPrice ? 2 : 0 }}
      value={draft}
      onChange={setDraft}
      onBlur={commit}
      isDisabled={isDisabled}
      aria-label={label}
    >
      <NumberField.Group className="flex h-9 items-center rounded-lg border border-field-border bg-surface-soft px-2">
        <NumberField.Input className="w-full bg-transparent text-sm text-accent outline-none" />
      </NumberField.Group>
    </NumberField>
  )
}

export function ProductVariantsCard({ productId }: ProductVariantsCardProps) {
  const { t, locale } = useTranslation()
  const items = useProductVariantsStore((state) => state.items)
  const isLoading = useProductVariantsStore((state) => state.isLoading)
  const isMutating = useProductVariantsStore((state) => state.isMutating)
  const errorCode = useProductVariantsStore((state) => state.errorCode)
  const errorDetails = useProductVariantsStore((state) => state.errorDetails)
  const updateVariant = useProductVariantsStore((state) => state.update)
  const removeVariant = useProductVariantsStore((state) => state.remove)
  const clearError = useProductVariantsStore((state) => state.clearError)
  const characteristicTypes = useCharacteristicTypesStore((state) => state.items)
  const loadCharacteristicTypes = useCharacteristicTypesStore((state) => state.load)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [valueTarget, setValueTarget] = useState<{
    characteristicTypeId: string
    onCreated: (value: CharacteristicTypeValue) => void
  } | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    void loadCharacteristicTypes()
  }, [loadCharacteristicTypes])

  const errorMessage = isModalOpen ? null : describeVariantError(errorCode, errorDetails, t)

  function optionsLabel(variant: ProductVariant) {
    return variant.options
      .map((option) => {
        const label =
          locale === 'ro' ? option.characteristicTypeLabelRo : option.characteristicTypeLabelRu
        const value = locale === 'ro' ? option.valueRo : option.valueRu
        return `${label}: ${value}`
      })
      .join(' · ')
  }

  async function commitPrice(variant: ProductVariant, value: number) {
    clearError()
    return (await updateVariant(variant.id, { regularPrice: value.toFixed(2) })) !== null
  }

  async function commitStock(variant: ProductVariant, value: number) {
    clearError()
    return (await updateVariant(variant.id, { stockQuantity: Math.trunc(value) })) !== null
  }

  async function confirmDelete(variant: ProductVariant) {
    clearError()
    await removeVariant(variant.id)
    setConfirmingId(null)
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-xl border border-field-border bg-white p-6">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="font-heading text-lg font-bold text-accent">
          {t('products.new.sections.variants.title')}
        </p>
        <Button
          type="button"
          isDisabled={!productId}
          onPress={() => {
            clearError()
            setIsModalOpen(true)
          }}
          className="gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:bg-surface-soft disabled:text-accent/45"
        >
          <svg className="size-4" aria-hidden="true">
            <use href="#plus-icon" />
          </svg>
          {t('products.new.sections.variants.add')}
        </Button>
      </div>

      <p className="text-[13px] text-accent/70">
        {t('products.new.sections.variants.managedNote')}
      </p>

      <AnimatePresence>
        {errorMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{errorMessage}</Alert.Title>
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!productId ? (
        <p className="rounded-lg border border-dashed border-field-border bg-surface-soft px-4 py-6 text-center text-sm text-accent/75">
          {t('products.new.sections.variants.saveFirst')}
        </p>
      ) : isLoading ? (
        <div className="flex min-h-32 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-field-border bg-surface-soft px-4 py-6 text-center text-sm text-accent/75">
              {t('products.new.sections.variants.empty')}
            </p>
          ) : (
            <div className="w-full">
              <div className="grid w-full grid-cols-[minmax(0,1fr)_120px_120px_100px_72px_100px] items-center gap-x-3 border-b border-field-border pb-3">
                <p className="min-w-0 text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.options')}
                </p>
                <p className="text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.sku')}
                </p>
                <p className="text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.price')}
                </p>
                <p className="text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.stock')}
                </p>
                <p className="text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.active')}
                </p>
                <p className="text-center text-[13px] font-bold text-muted">
                  {t('products.new.sections.variants.columns.actions')}
                </p>
              </div>
              <AnimatePresence initial={false}>
                {items.map((variant) => (
                  <motion.div
                    key={variant.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_120px_120px_100px_72px_100px] items-center gap-x-3 border-b border-field-border py-5 last:border-b-0 ${
                      variant.isActive ? '' : 'opacity-60'
                    }`}
                  >
                    <p className="min-w-0 text-sm font-semibold text-accent">
                      {optionsLabel(variant)}
                    </p>
                    <p className="min-w-0 truncate text-sm text-muted">
                      {variant.sku ?? '—'}
                    </p>
                    <div className="relative">
                      <InlineNumberCell
                        isPrice
                        value={variant.regularPrice === null ? null : Number(variant.regularPrice)}
                        label={t('products.new.sections.variants.columns.price')}
                        isDisabled={isMutating}
                        onCommit={(value) => commitPrice(variant, value)}
                      />
                      {variant.discountPrice ? (
                        <span className="absolute left-1 top-full pt-0.5 text-xs text-accent/70">
                          −{variant.discountPrice}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <InlineNumberCell
                        value={variant.stockQuantity}
                        label={t('products.new.sections.variants.columns.stock')}
                        isDisabled={isMutating}
                        onCommit={(value) => commitStock(variant, value)}
                      />
                    </div>
                    <div className="flex items-center">
                      <Switch
                        isSelected={variant.isActive}
                        isDisabled={isMutating}
                        aria-label={t('products.new.sections.variants.columns.active')}
                        onChange={(isActive) => {
                          clearError()
                          void updateVariant(variant.id, { isActive })
                        }}
                      >
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {confirmingId === variant.id ? (
                        <>
                          <Button
                            size="sm"
                            isDisabled={isMutating}
                            onPress={() => void confirmDelete(variant)}
                            className="h-8! rounded-md! bg-accent! px-2! text-xs! font-semibold! text-white!"
                          >
                            {t('products.new.sections.variants.actions.confirmDelete')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label={t('products.new.sections.variants.actions.cancel')}
                            onPress={() => setConfirmingId(null)}
                          >
                            <svg className="size-3.5 text-accent" aria-hidden="true">
                              <use href="#x-icon" />
                            </svg>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          isDisabled={isMutating}
                          aria-label={t('products.new.sections.variants.actions.delete')}
                          onPress={() => setConfirmingId(variant.id)}
                        >
                          <svg className="size-4 text-accent" aria-hidden="true">
                            <use href="#trash-icon" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <ProductVariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateType={() => setIsTypeModalOpen(true)}
        onCreateValue={(characteristicTypeId, onCreated) =>
          setValueTarget({ characteristicTypeId, onCreated })
        }
      />
      <CharacteristicTypeModal
        isOpen={isTypeModalOpen}
        defaultUsedForVariations
        defaultSortOrder={characteristicTypes.reduce(
          (max, type) => Math.max(max, type.sortOrder + 1),
          0,
        )}
        onClose={() => setIsTypeModalOpen(false)}
      />
      <CharacteristicTypeValueModal
        isOpen={valueTarget !== null}
        characteristicTypeId={valueTarget?.characteristicTypeId ?? null}
        onSaved={(value) => valueTarget?.onCreated(value)}
        onClose={() => setValueTarget(null)}
      />
    </div>
  )
}
