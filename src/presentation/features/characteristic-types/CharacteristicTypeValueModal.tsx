import { Button, Input, Label, Modal, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { CharacteristicTypeValue } from '../../../domain/characteristic-types/types'
import { useTranslation } from '../../../shared/i18n'
import { useCharacteristicTypesStore } from '../../stores/characteristic-types.store'

interface CharacteristicTypeValueModalProps {
  isOpen: boolean
  characteristicTypeId: string | null
  onClose: () => void
  onSaved?: (value: CharacteristicTypeValue) => void
}

interface ValueFormValues {
  valueRo: string
  valueRu: string
}

const VALUE_MAX_LENGTH = 255

export function CharacteristicTypeValueModal({
  isOpen,
  characteristicTypeId,
  onClose,
  onSaved,
}: CharacteristicTypeValueModalProps) {
  const { t } = useTranslation()
  const createValue = useCharacteristicTypesStore((state) => state.createValue)
  const isMutating = useCharacteristicTypesStore((state) => state.isMutating)
  const errorCode = useCharacteristicTypesStore((state) => state.errorCode)
  const clearError = useCharacteristicTypesStore((state) => state.clearError)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValueFormValues>({
    mode: 'onTouched',
    defaultValues: { valueRo: '', valueRu: '' },
  })

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset({ valueRo: '', valueRu: '' })
  }, [isOpen, reset, clearError])

  const rules = {
    validate: (value: string) =>
      value.trim().length > 0 || t('characteristicTypes.valueErrors.required'),
    maxLength: {
      value: VALUE_MAX_LENGTH,
      message: t('characteristicTypes.valueErrors.required'),
    },
  }

  const serverError =
    errorCode === 'CONFLICT'
      ? t('characteristicTypes.valueErrors.conflict')
      : errorCode === 'VALIDATION'
        ? t('characteristicTypes.errors.validation')
        : errorCode === 'FORBIDDEN'
          ? t('characteristicTypes.errors.forbidden')
          : errorCode === 'NOT_FOUND'
            ? t('characteristicTypes.errors.notFound')
            : errorCode
              ? t('characteristicTypes.errors.unknown')
              : null

  const onSubmit = handleSubmit(async (values) => {
    if (!characteristicTypeId) return
    const saved = await createValue(characteristicTypeId, {
      valueRo: values.valueRo.trim(),
      valueRu: values.valueRu.trim(),
    })
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
                {t('characteristicTypes.valueModal.title')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}
              <p className="text-[13px] text-accent/70">
                {t('characteristicTypes.valueModal.hint')}
              </p>

              <TextField name="valueRo" isInvalid={!!errors.valueRo} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.valueModal.valueRo')}
                </Label>
                <Input fullWidth autoFocus placeholder="200 ml" {...register('valueRo', rules)} />
                {errors.valueRo ? (
                  <p className="text-xs text-danger">{errors.valueRo.message}</p>
                ) : null}
              </TextField>

              <TextField name="valueRu" isInvalid={!!errors.valueRu} className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-accent">
                  {t('characteristicTypes.valueModal.valueRu')}
                </Label>
                <Input fullWidth placeholder="200 мл" {...register('valueRu', rules)} />
                {errors.valueRu ? (
                  <p className="text-xs text-danger">{errors.valueRu.message}</p>
                ) : null}
              </TextField>
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
