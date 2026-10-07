import { Button, Checkbox, Input, Label, Modal, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { CharacteristicType } from '../../../domain/characteristic-types/types'
import { useTranslation } from '../../../shared/i18n'
import { useCharacteristicTypesStore } from '../../stores/characteristic-types.store'

interface CharacteristicTypeModalProps {
  isOpen: boolean
  type?: CharacteristicType | null
  defaultSortOrder?: number
  defaultUsedForVariations?: boolean
  onClose: () => void
  onSaved?: (type: CharacteristicType) => void
}

interface CharacteristicTypeFormValues {
  key: string
  labelRo: string
  labelRu: string
  unit: string
  sortOrder: string
  usedForVariations: boolean
  isActive: boolean
}

const KEY_PATTERN = /^[a-z0-9_]+$/
const INTEGER_PATTERN = /^-?\d+$/
const KEY_MAX_LENGTH = 100
const LABEL_MAX_LENGTH = 100
const UNIT_MAX_LENGTH = 30

function toFormValues(
  type: CharacteristicType | null,
  defaultSortOrder: number,
  defaultUsedForVariations: boolean,
): CharacteristicTypeFormValues {
  return {
    key: type?.key ?? '',
    labelRo: type?.labelRo ?? '',
    labelRu: type?.labelRu ?? '',
    unit: type?.unit ?? '',
    usedForVariations: type?.usedForVariations ?? defaultUsedForVariations,
    sortOrder: String(type?.sortOrder ?? defaultSortOrder),
    isActive: type?.isActive ?? true,
  }
}

export function CharacteristicTypeModal({
  isOpen,
  type = null,
  defaultSortOrder = 0,
  defaultUsedForVariations = false,
  onClose,
  onSaved,
}: CharacteristicTypeModalProps) {
  const { t } = useTranslation()
  const create = useCharacteristicTypesStore((state) => state.create)
  const update = useCharacteristicTypesStore((state) => state.update)
  const isMutating = useCharacteristicTypesStore((state) => state.isMutating)
  const errorCode = useCharacteristicTypesStore((state) => state.errorCode)
  const clearError = useCharacteristicTypesStore((state) => state.clearError)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CharacteristicTypeFormValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(type, defaultSortOrder, defaultUsedForVariations),
  })

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset(toFormValues(type, defaultSortOrder, defaultUsedForVariations))
  }, [isOpen, type, defaultSortOrder, defaultUsedForVariations, reset, clearError])

  const requiredRule = (value: string) =>
    value.trim().length > 0 || t('characteristicTypes.errors.required')

  const labelRules = {
    validate: requiredRule,
    maxLength: { value: LABEL_MAX_LENGTH, message: t('characteristicTypes.errors.maxLength') },
  }

  const serverError =
    errorCode === 'CONFLICT'
      ? t('characteristicTypes.errors.conflict')
      : errorCode === 'VALIDATION'
        ? t('characteristicTypes.errors.validation')
        : errorCode === 'FORBIDDEN'
          ? t('characteristicTypes.errors.forbidden')
          : errorCode
            ? t('characteristicTypes.errors.unknown')
            : null

  const onSubmit = handleSubmit(async (values) => {
    const fields = {
      labelRo: values.labelRo.trim(),
      labelRu: values.labelRu.trim(),
      unit: values.unit.trim() === '' ? null : values.unit.trim(),
      usedForVariations: values.usedForVariations,
      sortOrder: values.sortOrder.trim() === '' ? undefined : Number(values.sortOrder),
      isActive: values.isActive,
    }
    const saved = type
      ? await update(type.id, fields)
      : await create({ key: values.key.trim(), ...fields })
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
                {type
                  ? t('characteristicTypes.modal.editTitle')
                  : t('characteristicTypes.modal.createTitle')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

              <TextField name="key" isInvalid={!!errors.key} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.modal.key')}{' '}
                  <span className="font-normal text-muted">
                    ({t('characteristicTypes.modal.keyHint')})
                  </span>
                </Label>
                <Input
                  fullWidth
                  autoFocus={!type}
                  disabled={!!type}
                  placeholder="country"
                  {...register('key', {
                    validate: (value) =>
                      requiredRule(value) === true
                        ? KEY_PATTERN.test(value.trim()) ||
                          t('characteristicTypes.errors.keyFormat')
                        : requiredRule(value),
                    maxLength: {
                      value: KEY_MAX_LENGTH,
                      message: t('characteristicTypes.errors.maxLength'),
                    },
                  })}
                />
                {errors.key ? <p className="text-xs text-danger">{errors.key.message}</p> : null}
              </TextField>

              <TextField
                name="labelRo"
                isInvalid={!!errors.labelRo}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.modal.labelRo')}
                </Label>
                <Input fullWidth placeholder="Țara producătoare" {...register('labelRo', labelRules)} />
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
                  {t('characteristicTypes.modal.labelRu')}
                </Label>
                <Input fullWidth placeholder="Страна производителя" {...register('labelRu', labelRules)} />
                {errors.labelRu ? (
                  <p className="text-xs text-danger">{errors.labelRu.message}</p>
                ) : null}
              </TextField>

              <TextField name="unit" isInvalid={!!errors.unit} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.modal.unit')}{' '}
                  <span className="font-normal text-muted">
                    ({t('characteristicTypes.modal.unitHint')})
                  </span>
                </Label>
                <Input
                  fullWidth
                  {...register('unit', {
                    maxLength: {
                      value: UNIT_MAX_LENGTH,
                      message: t('characteristicTypes.errors.maxLength'),
                    },
                  })}
                />
                {errors.unit ? <p className="text-xs text-danger">{errors.unit.message}</p> : null}
              </TextField>

              <TextField
                name="sortOrder"
                isInvalid={!!errors.sortOrder}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.modal.sortOrder')}
                </Label>
                <Input
                  fullWidth
                  inputMode="numeric"
                  {...register('sortOrder', {
                    validate: (value) =>
                      value.trim() === '' ||
                      INTEGER_PATTERN.test(value.trim()) ||
                      t('characteristicTypes.errors.integer'),
                  })}
                />
                {errors.sortOrder ? (
                  <p className="text-xs text-danger">{errors.sortOrder.message}</p>
                ) : null}
              </TextField>

              <Controller
                control={control}
                name="usedForVariations"
                render={({ field: { value, onChange, name } }) => (
                  <Checkbox isSelected={value} isDisabled={!!type} onChange={onChange} name={name}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Label className="text-sm text-accent">
                        {t('characteristicTypes.usedForVariations')}{' '}
                        <span className="text-muted">
                          ({t('characteristicTypes.usedForVariationsHint')})
                        </span>
                      </Label>
                    </Checkbox.Content>
                  </Checkbox>
                )}
              />

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
                        {t('characteristicTypes.modal.isActive')}{' '}
                        <span className="text-muted">
                          ({t('characteristicTypes.modal.isActiveHint')})
                        </span>
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
