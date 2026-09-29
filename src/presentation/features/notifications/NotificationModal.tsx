import { Button, Checkbox, Input, Label, Modal, TextArea, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Notification } from '../../../domain/notifications/types'
import { useTranslation } from '../../../shared/i18n'
import { useNotificationsStore } from '../../stores/notifications.store'

interface NotificationModalProps {
  isOpen: boolean
  notification: Notification | null
  onClose: () => void
}

interface NotificationFormValues {
  messageRo: string
  messageRu: string
  isActive: boolean
  noExpiry: boolean
  durationHours: string
}

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/

function toFormValues(notification: Notification | null): NotificationFormValues {
  return {
    messageRo: notification?.message.ro ?? '',
    messageRu: notification?.message.ru ?? '',
    isActive: notification?.isActive ?? true,
    noExpiry: notification ? notification.expiresAt === null : true,
    durationHours: '',
  }
}

export function NotificationModal({ isOpen, notification, onClose }: NotificationModalProps) {
  const { t } = useTranslation()
  const create = useNotificationsStore((state) => state.create)
  const update = useNotificationsStore((state) => state.update)
  const isMutating = useNotificationsStore((state) => state.isMutating)
  const errorCode = useNotificationsStore((state) => state.errorCode)
  const clearError = useNotificationsStore((state) => state.clearError)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(notification),
  })

  const noExpiry = watch('noExpiry')

  useEffect(() => {
    if (!isOpen) return
    clearError()
    reset(toFormValues(notification))
  }, [isOpen, notification, reset, clearError])

  const messageRules = {
    validate: (value: string) => value.trim().length > 0 || t('notifications.errors.required'),
  }

  const serverError =
    errorCode === 'VALIDATION'
      ? t('notifications.errors.validation')
      : errorCode === 'NOT_FOUND'
        ? t('notifications.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('notifications.errors.forbidden')
          : errorCode
            ? t('notifications.errors.unknown')
            : null

  const onSubmit = handleSubmit(async (values) => {
    const message = { ro: values.messageRo.trim(), ru: values.messageRu.trim() }
    const hours = values.durationHours.trim() === '' ? undefined : Number(values.durationHours)

    let saved: Notification | null
    if (notification) {
      let durationHours: number | null | undefined
      if (values.noExpiry) durationHours = notification.expiresAt === null ? undefined : null
      else durationHours = hours
      saved = await update(notification.id, {
        message,
        isActive: values.isActive,
        durationHours,
      })
    } else {
      saved = await create({
        message,
        isActive: values.isActive,
        durationHours: values.noExpiry ? undefined : hours,
      })
    }
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
        <Modal.Dialog className="w-full max-w-lg rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          <form onSubmit={onSubmit} noValidate className="flex flex-col">
            <Modal.Header>
              <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                {notification
                  ? t('notifications.modal.editTitle')
                  : t('notifications.modal.createTitle')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 pt-4">
              {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

              <TextField
                name="messageRo"
                isInvalid={!!errors.messageRo}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('notifications.modal.messageRo')}
                </Label>
                <TextArea
                  fullWidth
                  rows={3}
                  placeholder="Reduceri de toamnă -20%!"
                  {...register('messageRo', messageRules)}
                />
                {errors.messageRo ? (
                  <p className="text-xs text-danger">{errors.messageRo.message}</p>
                ) : null}
              </TextField>

              <TextField
                name="messageRu"
                isInvalid={!!errors.messageRu}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-accent">
                  {t('notifications.modal.messageRu')}
                </Label>
                <TextArea
                  fullWidth
                  rows={3}
                  placeholder="Осенние скидки -20%!"
                  {...register('messageRu', messageRules)}
                />
                {errors.messageRu ? (
                  <p className="text-xs text-danger">{errors.messageRu.message}</p>
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
                        {t('notifications.modal.isActive')}{' '}
                        <span className="text-muted">({t('notifications.modal.isActiveHint')})</span>
                      </Label>
                    </Checkbox.Content>
                  </Checkbox>
                )}
              />

              <Controller
                control={control}
                name="noExpiry"
                render={({ field: { value, onChange, name } }) => (
                  <Checkbox isSelected={value} onChange={onChange} name={name}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Label className="text-sm text-accent">
                        {t('notifications.modal.noExpiry')}
                      </Label>
                    </Checkbox.Content>
                  </Checkbox>
                )}
              />

              {!noExpiry ? (
                <TextField
                  name="durationHours"
                  isInvalid={!!errors.durationHours}
                  className="flex flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-accent">
                    {t('notifications.modal.durationHours')}
                  </Label>
                  <Input
                    fullWidth
                    inputMode="numeric"
                    placeholder="72"
                    {...register('durationHours', {
                      validate: (value) => {
                        const trimmed = value.trim()
                        if (trimmed === '') {
                          return notification?.expiresAt
                            ? true
                            : t('notifications.errors.required')
                        }
                        return (
                          POSITIVE_INTEGER_PATTERN.test(trimmed) ||
                          t('notifications.errors.positiveInteger')
                        )
                      },
                    })}
                  />
                  {errors.durationHours ? (
                    <p className="text-xs text-danger">{errors.durationHours.message}</p>
                  ) : (
                    <p className="text-xs text-muted">
                      {notification
                        ? t('notifications.modal.durationEditHint')
                        : t('notifications.modal.durationHint')}
                    </p>
                  )}
                </TextField>
              ) : null}
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
