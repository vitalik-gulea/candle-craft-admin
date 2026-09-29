import { Button, Checkbox, Input, Label, Modal, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { UnitOfSale } from '../../../domain/units-of-sale/types'
import { useTranslation } from '../../../shared/i18n'
import { useUnitsOfSaleStore } from '../../stores/units-of-sale.store'

interface UnitOfSaleModalProps {
  isOpen: boolean
  unit: UnitOfSale | null
  defaultSortOrder?: number
  onClose: () => void
  onSaved?: (unit: UnitOfSale) => void
}

interface UnitOfSaleFormValues {
  nameRo: string
  nameRu: string
  sortOrder: string
  isActive: boolean
}

const NAME_MAX_LENGTH = 100
const INTEGER_PATTERN = /^-?\d+$/

function toFormValues(unit: UnitOfSale | null, defaultSortOrder: number): UnitOfSaleFormValues {
  return {
    nameRo: unit?.name.ro ?? '',
    nameRu: unit?.name.ru ?? '',
    sortOrder: String(unit?.sortOrder ?? defaultSortOrder),
    isActive: unit?.isActive ?? true,
  }
}

export function UnitOfSaleModal({
  isOpen,
  unit,
  defaultSortOrder = 0,
  onClose,
  onSaved,
}: UnitOfSaleModalProps) {
  const { t } = useTranslation()
  const create = useUnitsOfSaleStore((state) => state.create)
  const update = useUnitsOfSaleStore((state) => state.update)
  const isMutating = useUnitsOfSaleStore((state) => state.isMutating)
  const errorCode = useUnitsOfSaleStore((state) => state.errorCode)
  const clearError = useUnitsOfSaleStore((state) => state.clearError)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitOfSaleFormValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(unit, defaultSortOrder),
  })

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset(toFormValues(unit, defaultSortOrder))
  }, [isOpen, unit, defaultSortOrder, reset, clearError])

  const nameRules = {
    required: t('unitsOfSale.errors.required'),
    validate: (value: string) => value.trim().length > 0 || t('unitsOfSale.errors.required'),
    maxLength: { value: NAME_MAX_LENGTH, message: t('unitsOfSale.errors.maxLength') },
  }

  const serverError =
    errorCode === 'VALIDATION'
      ? t('unitsOfSale.errors.validation')
      : errorCode === 'NOT_FOUND'
        ? t('unitsOfSale.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('unitsOfSale.errors.forbidden')
          : errorCode
            ? t('unitsOfSale.errors.unknown')
            : null

  const onSubmit = handleSubmit(async (values) => {
    const sortOrder = values.sortOrder.trim() === '' ? undefined : Number(values.sortOrder)
    const input = {
      name: { ro: values.nameRo.trim(), ru: values.nameRu.trim() },
      sortOrder,
      isActive: values.isActive,
    }
    const saved = unit ? await update(unit.id, input) : await create(input)
    if (!saved) return
    onSaved?.(saved)
    onClose()
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
                {unit ? t('unitsOfSale.modal.editTitle') : t('unitsOfSale.modal.createTitle')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

              <TextField name="nameRo" isInvalid={!!errors.nameRo} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('unitsOfSale.modal.nameRo')}
                </Label>
                <Input fullWidth autoFocus placeholder="bucată" {...register('nameRo', nameRules)} />
                {errors.nameRo ? (
                  <p className="text-xs text-danger">{errors.nameRo.message}</p>
                ) : null}
              </TextField>

              <TextField name="nameRu" isInvalid={!!errors.nameRu} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('unitsOfSale.modal.nameRu')}
                </Label>
                <Input fullWidth placeholder="штука" {...register('nameRu', nameRules)} />
                {errors.nameRu ? (
                  <p className="text-xs text-danger">{errors.nameRu.message}</p>
                ) : null}
              </TextField>

              <TextField
                name="sortOrder"
                isInvalid={!!errors.sortOrder}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('unitsOfSale.modal.sortOrder')}
                </Label>
                <Input
                  fullWidth
                  inputMode="numeric"
                  {...register('sortOrder', {
                    validate: (value) =>
                      value.trim() === '' ||
                      INTEGER_PATTERN.test(value.trim()) ||
                      t('unitsOfSale.errors.integer'),
                  })}
                />
                {errors.sortOrder ? (
                  <p className="text-xs text-danger">{errors.sortOrder.message}</p>
                ) : null}
              </TextField>

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
                        {t('unitsOfSale.modal.isActive')}{' '}
                        <span className="text-muted">({t('unitsOfSale.modal.isActiveHint')})</span>
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
