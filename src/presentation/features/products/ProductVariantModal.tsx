import { Button, Checkbox, Input, Label, ListBox, Modal, Select, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import type {
  CharacteristicType,
  CharacteristicTypeValue,
} from '../../../domain/characteristic-types/types'
import type { ProductVariant } from '../../../domain/product-variants/types'
import { useTranslation } from '../../../shared/i18n'
import { useCharacteristicTypesStore } from '../../stores/characteristic-types.store'
import { useProductVariantsStore } from '../../stores/product-variants.store'
import { describeVariantError } from './product-variant-errors'

interface ProductVariantModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateType: () => void
  onCreateValue: (
    characteristicTypeId: string,
    onCreated: (value: CharacteristicTypeValue) => void,
  ) => void
  onSaved?: (variant: ProductVariant) => void
}

interface OptionRowValues {
  characteristicTypeId: string
  valueId: string
}

interface ProductVariantFormValues {
  sku: string
  regularPrice: string
  discountPrice: string
  discountStartAt: string
  discountEndAt: string
  stockQuantity: string
  isActive: boolean
  options: OptionRowValues[]
}

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/
const INTEGER_PATTERN = /^\d+$/

const EMPTY_OPTION: OptionRowValues = { characteristicTypeId: '', valueId: '' }

const DEFAULT_VALUES: ProductVariantFormValues = {
  sku: '',
  regularPrice: '',
  discountPrice: '',
  discountStartAt: '',
  discountEndAt: '',
  stockQuantity: '0',
  isActive: true,
  options: [EMPTY_OPTION],
}

const selectTriggerClassName =
  'flex! h-10! w-full! items-center! justify-between! gap-2! rounded-lg! border! border-field-border! bg-surface-soft! px-3! shadow-none!'

const selectPopoverClassName =
  'rounded-md! border! border-field-border! bg-[#eef2df]! p-1! shadow-none!'

const selectOptionClassName =
  'min-h-0! w-full! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! leading-[18px]! text-accent! shadow-none! outline-none! data-[focused=true]:bg-accent/10! data-[hovered=true]:bg-accent/10! data-[selected=true]:bg-accent/15!'

const EMPTY_VALUES: CharacteristicTypeValue[] = []

function formatPrice(value: string): string {
  const [whole, fraction = ''] = value.trim().split('.')
  return `${whole}.${fraction.padEnd(2, '0')}`
}

function formatDateTime(value: string): string | null {
  if (!value) return null
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

export function ProductVariantModal({
  isOpen,
  onClose,
  onCreateType,
  onCreateValue,
  onSaved,
}: ProductVariantModalProps) {
  const { t, locale } = useTranslation()
  const create = useProductVariantsStore((state) => state.create)
  const isMutating = useProductVariantsStore((state) => state.isMutating)
  const errorCode = useProductVariantsStore((state) => state.errorCode)
  const errorDetails = useProductVariantsStore((state) => state.errorDetails)
  const clearError = useProductVariantsStore((state) => state.clearError)
  const characteristicTypes = useCharacteristicTypesStore((state) => state.items)
  const valuesByType = useCharacteristicTypesStore((state) => state.values)
  const loadValues = useCharacteristicTypesStore((state) => state.loadValues)

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductVariantFormValues>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  })

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: 'options' })

  const watchedOptions = useWatch({ control, name: 'options' })

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset(DEFAULT_VALUES)
  }, [isOpen, reset, clearError])

  const variationTypes = characteristicTypes.filter(
    (type) => type.usedForVariations && type.isActive,
  )
  const serverError = describeVariantError(errorCode, errorDetails, t)
  const requiredRule = (value: string) =>
    value.trim().length > 0 || t('products.new.sections.variants.errors.required')

  const typeLabel = (type: CharacteristicType) =>
    locale === 'ro' ? type.labelRo : type.labelRu
  const valueLabel = (value: CharacteristicTypeValue) => `${value.valueRo} / ${value.valueRu}`

  const onSubmit = handleSubmit(async (values) => {
    const options = values.options.map((row) => ({
      characteristicTypeId: row.characteristicTypeId,
      valueId: row.valueId,
    }))
    if (
      new Set(options.map((option) => option.characteristicTypeId)).size !== options.length
    ) {
      setError('options', {
        type: 'validate',
        message: t('products.new.sections.variants.errors.optionsDuplicate'),
      })
      return
    }
    const saved = await create({
      sku: values.sku.trim() === '' ? null : values.sku.trim(),
      regularPrice: formatPrice(values.regularPrice),
      discountPrice: values.discountPrice.trim() === '' ? null : formatPrice(values.discountPrice),
      discountStartAt: formatDateTime(values.discountStartAt),
      discountEndAt: formatDateTime(values.discountEndAt),
      stockQuantity: Number(values.stockQuantity),
      isActive: values.isActive,
      options,
    })
    if (!saved) return
    onSaved?.(saved)
    onClose()
  })

  const optionsError =
    errors.options && !Array.isArray(errors.options) ? errors.options.message : undefined

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container scroll="outside">
        <Modal.Dialog className="w-full max-w-2xl rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          <form onSubmit={onSubmit} noValidate className="flex flex-col">
            <Modal.Header>
              <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                {t('products.new.sections.variants.modal.title')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-5 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.options')}
                  </Label>
                  <button
                    type="button"
                    onClick={onCreateType}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    {t('characteristicTypes.createInline')}
                  </button>
                </div>
                {variationTypes.length === 0 ? (
                  <p className="text-[13px] text-accent/70">
                    {t('products.new.sections.variants.modal.noAttributes')}
                  </p>
                ) : null}
                {optionFields.map((field, index) => {
                  const rowTypeId = watchedOptions?.[index]?.characteristicTypeId ?? ''
                  const rowValues = valuesByType[rowTypeId] ?? EMPTY_VALUES
                  const selectableValues = rowValues.filter((value) => value.isActive)
                  const selectedType = characteristicTypes.find((type) => type.id === rowTypeId)
                  const selectedValue = rowValues.find(
                    (value) => value.id === watchedOptions?.[index]?.valueId,
                  )
                  return (
                    <div
                      key={field.id}
                      className="flex w-full items-start gap-2 rounded-lg border border-field-border bg-surface-soft p-3"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Controller
                          control={control}
                          name={`options.${index}.characteristicTypeId`}
                          rules={{ validate: requiredRule }}
                          render={({ field: typeField }) => (
                            <Select
                              selectedKey={typeField.value || null}
                              onSelectionChange={(key) => {
                                const nextId = key ? String(key) : ''
                                typeField.onChange(nextId)
                                setValue(`options.${index}.valueId`, '')
                                if (nextId) void loadValues(nextId)
                              }}
                              aria-label={t('products.new.sections.variants.modal.attribute')}
                            >
                              <Select.Trigger className={selectTriggerClassName}>
                                <span className="text-sm font-medium text-accent">
                                  {selectedType
                                    ? typeLabel(selectedType)
                                    : t('products.new.sections.variants.modal.attributePlaceholder')}
                                </span>
                                <Select.Indicator className="size-4 shrink-0 text-accent">
                                  <use href="#chevron-down-icon" />
                                </Select.Indicator>
                              </Select.Trigger>
                              <Select.Popover className={selectPopoverClassName}>
                                <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                                  {variationTypes.map((type) => (
                                    <ListBox.Item
                                      key={type.id}
                                      id={type.id}
                                      textValue={typeLabel(type)}
                                      className={selectOptionClassName}
                                    >
                                      {typeLabel(type)}
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          )}
                        />
                        {errors.options?.[index]?.characteristicTypeId ? (
                          <p className="text-xs text-danger">
                            {errors.options[index]?.characteristicTypeId?.message}
                          </p>
                        ) : null}

                        {rowTypeId ? (
                          <>
                            <div className="flex w-full items-center justify-between gap-3">
                              <Label className="text-[13px] font-semibold text-accent">
                                {t('products.new.sections.variants.modal.value')}
                              </Label>
                              <button
                                type="button"
                                onClick={() =>
                                  onCreateValue(rowTypeId, (created) =>
                                    setValue(`options.${index}.valueId`, created.id, {
                                      shouldValidate: true,
                                    }),
                                  )
                                }
                                className="text-[13px] font-semibold text-accent hover:underline"
                              >
                                {t('characteristicTypes.addValue')}
                              </button>
                            </div>
                            <Controller
                              control={control}
                              name={`options.${index}.valueId`}
                              rules={{ validate: requiredRule }}
                              render={({ field: valueField }) => (
                                <Select
                                  selectedKey={valueField.value || null}
                                  onSelectionChange={(key) =>
                                    valueField.onChange(key ? String(key) : '')
                                  }
                                  aria-label={t('products.new.sections.variants.modal.value')}
                                >
                                  <Select.Trigger className={selectTriggerClassName}>
                                    <span className="text-sm font-medium text-accent">
                                      {selectedValue
                                        ? valueLabel(selectedValue)
                                        : t('products.new.sections.variants.modal.valuePlaceholder')}
                                    </span>
                                    <Select.Indicator className="size-4 shrink-0 text-accent">
                                      <use href="#chevron-down-icon" />
                                    </Select.Indicator>
                                  </Select.Trigger>
                                  <Select.Popover className={selectPopoverClassName}>
                                    <ListBox className="max-h-64 overflow-y-auto bg-transparent! p-0! outline-none!">
                                      {selectableValues.map((value) => (
                                        <ListBox.Item
                                          key={value.id}
                                          id={value.id}
                                          textValue={valueLabel(value)}
                                          className={selectOptionClassName}
                                        >
                                          {valueLabel(value)}
                                        </ListBox.Item>
                                      ))}
                                    </ListBox>
                                  </Select.Popover>
                                </Select>
                              )}
                            />
                            {selectableValues.length === 0 ? (
                              <p className="text-[13px] text-accent/70">
                                {t('products.new.sections.variants.modal.noValues')}
                              </p>
                            ) : null}
                            {errors.options?.[index]?.valueId ? (
                              <p className="text-xs text-danger">
                                {errors.options[index]?.valueId?.message}
                              </p>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        isDisabled={optionFields.length === 1}
                        aria-label={t('products.new.sections.variants.modal.removeOption')}
                        onPress={() => removeOption(index)}
                      >
                        <svg className="size-4 text-accent" aria-hidden="true">
                          <use href="#trash-icon" />
                        </svg>
                      </Button>
                    </div>
                  )
                })}
                {optionsError ? <p className="text-xs text-danger">{optionsError}</p> : null}
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => appendOption({ ...EMPTY_OPTION })}
                  className="h-9! w-fit! gap-2! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
                >
                  <svg className="size-4" aria-hidden="true">
                    <use href="#plus-icon" />
                  </svg>
                  {t('products.new.sections.variants.modal.addOption')}
                </Button>
              </div>

              <div className="flex w-full gap-4">
                <TextField
                  name="regularPrice"
                  isInvalid={!!errors.regularPrice}
                  className="flex flex-1 flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.price')}
                  </Label>
                  <Input
                    fullWidth
                    inputMode="decimal"
                    placeholder="250.00"
                    {...register('regularPrice', {
                      validate: (value) =>
                        value.trim() === ''
                          ? t('products.new.sections.variants.errors.required')
                          : PRICE_PATTERN.test(value.trim()) ||
                            t('products.new.sections.variants.errors.priceInvalid'),
                    })}
                  />
                  {errors.regularPrice ? (
                    <p className="text-xs text-danger">{errors.regularPrice.message}</p>
                  ) : null}
                </TextField>
                <TextField
                  name="discountPrice"
                  isInvalid={!!errors.discountPrice}
                  className="flex flex-1 flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.discountPrice')}
                  </Label>
                  <Input
                    fullWidth
                    inputMode="decimal"
                    {...register('discountPrice', {
                      validate: (value) => {
                        if (value.trim() === '') return true
                        if (!PRICE_PATTERN.test(value.trim())) {
                          return t('products.new.sections.variants.errors.discountPriceInvalid')
                        }
                        const regularPrice = Number(getValues('regularPrice'))
                        if (Number.isNaN(regularPrice)) return true
                        return (
                          Number(value) < regularPrice ||
                          t('products.new.sections.variants.errors.discountPriceTooHigh')
                        )
                      },
                    })}
                  />
                  {errors.discountPrice ? (
                    <p className="text-xs text-danger">{errors.discountPrice.message}</p>
                  ) : null}
                </TextField>
              </div>

              <div className="flex w-full gap-4">
                <TextField name="discountStartAt" className="flex flex-1 flex-col gap-2">
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.discountStart')}
                  </Label>
                  <Input fullWidth type="date" {...register('discountStartAt')} />
                </TextField>
                <TextField
                  name="discountEndAt"
                  isInvalid={!!errors.discountEndAt}
                  className="flex flex-1 flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.discountEnd')}
                  </Label>
                  <Input
                    fullWidth
                    type="date"
                    {...register('discountEndAt', {
                      validate: (value) => {
                        const start = getValues('discountStartAt')
                        if (!value || !start) return true
                        return (
                          value >= start ||
                          t('products.new.sections.variants.errors.discountPeriodInvalid')
                        )
                      },
                    })}
                  />
                  {errors.discountEndAt ? (
                    <p className="text-xs text-danger">{errors.discountEndAt.message}</p>
                  ) : null}
                </TextField>
              </div>

              <div className="flex w-full gap-4">
                <TextField
                  name="stockQuantity"
                  isInvalid={!!errors.stockQuantity}
                  className="flex flex-1 flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.stock')}
                  </Label>
                  <Input
                    fullWidth
                    inputMode="numeric"
                    {...register('stockQuantity', {
                      validate: (value) =>
                        INTEGER_PATTERN.test(value.trim()) ||
                        t('products.new.sections.variants.errors.stockInvalid'),
                    })}
                  />
                  {errors.stockQuantity ? (
                    <p className="text-xs text-danger">{errors.stockQuantity.message}</p>
                  ) : null}
                </TextField>
                <TextField name="sku" className="flex flex-1 flex-col gap-2">
                  <Label className="text-sm font-semibold text-accent">
                    {t('products.new.sections.variants.modal.sku')}
                  </Label>
                  <Input
                    fullWidth
                    placeholder={t('products.new.sections.variants.modal.skuPlaceholder')}
                    {...register('sku')}
                  />
                </TextField>
              </div>

              <Controller
                control={control}
                name="isActive"
                render={({ field: { value, onChange, name } }) => (
                  <Checkbox isSelected={value} onChange={onChange} name={name}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Label className="text-sm text-accent">
                        {t('products.new.sections.variants.modal.isActive')}
                      </Label>
                    </Checkbox.Content>
                  </Checkbox>
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
