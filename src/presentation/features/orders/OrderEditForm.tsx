import { Button, Input, Label, TextArea, TextField } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useForm, type Control, type RegisterOptions } from 'react-hook-form'
import type { Order, UpdateOrderInput } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'

interface OrderEditFormProps {
  order: Order
  isMutating: boolean
  serverError: string | null
  onSubmit: (changes: UpdateOrderInput) => Promise<boolean>
}

interface OrderEditFormValues {
  firstName: string
  lastName: string
  phone: string
  email: string
  deliveryCity: string
  deliveryAddress: string
  adminComment: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s().-]{6,20}$/

function toFormValues(order: Order): OrderEditFormValues {
  return {
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email,
    deliveryCity: order.deliveryCity ?? '',
    deliveryAddress: order.deliveryAddress ?? '',
    adminComment: order.adminComment ?? '',
  }
}

function buildChanges(order: Order, values: OrderEditFormValues): UpdateOrderInput {
  const changes: UpdateOrderInput = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const phone = values.phone.trim()
  const email = values.email.trim()
  const deliveryCity = values.deliveryCity.trim()
  const deliveryAddress = values.deliveryAddress.trim()
  const adminComment = values.adminComment.trim()

  if (firstName !== order.firstName) changes.firstName = firstName
  if (lastName !== order.lastName) changes.lastName = lastName
  if (phone !== order.phone) changes.phone = phone
  if (email !== order.email) changes.email = email
  if (deliveryCity !== (order.deliveryCity ?? '')) {
    changes.deliveryCity = deliveryCity === '' ? null : deliveryCity
  }
  if (deliveryAddress !== (order.deliveryAddress ?? '')) {
    changes.deliveryAddress = deliveryAddress === '' ? null : deliveryAddress
  }
  if (adminComment !== (order.adminComment ?? '')) {
    changes.adminComment = adminComment === '' ? null : adminComment
  }
  return changes
}

const cardClassName = 'flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6'
const cardTitleClassName = 'font-heading text-xl font-bold text-accent'
const labelClassName = 'text-sm font-semibold text-accent'

interface FormFieldProps {
  control: Control<OrderEditFormValues>
  name: keyof OrderEditFormValues
  label: string
  rules?: RegisterOptions<OrderEditFormValues, keyof OrderEditFormValues>
  type?: string
  maxLength?: number
  rows?: number
  placeholder?: string
  srOnlyLabel?: boolean
}

function FormField({
  control,
  name,
  label,
  rules,
  type,
  maxLength,
  rows,
  placeholder,
  srOnlyLabel,
}: FormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={!!fieldState.error}
          className="flex flex-col gap-2"
        >
          <Label className={srOnlyLabel ? 'sr-only' : labelClassName}>{label}</Label>
          {rows ? (
            <TextArea fullWidth rows={rows} maxLength={maxLength} placeholder={placeholder} />
          ) : (
            <Input fullWidth type={type} maxLength={maxLength} placeholder={placeholder} />
          )}
          {fieldState.error ? (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          ) : null}
        </TextField>
      )}
    />
  )
}

export function OrderEditForm({ order, isMutating, serverError, onSubmit }: OrderEditFormProps) {
  const { t } = useTranslation()
  const isDelivery = order.deliveryMethod !== 'pickup'

  const { control, handleSubmit, reset, watch } = useForm<OrderEditFormValues>({
    mode: 'onTouched',
    defaultValues: toFormValues(order),
  })

  useEffect(() => {
    reset(toFormValues(order), { keepDirtyValues: true })
  }, [order, reset])

  const values = watch()
  const hasChanges = Object.keys(buildChanges(order, values)).length > 0

  const required = (value: string) => value.trim().length > 0 || t('orders.errors.required')

  const submit = handleSubmit(async (formValues) => {
    const changes = buildChanges(order, formValues)
    if (Object.keys(changes).length === 0) return
    const saved = await onSubmit(changes)
    if (saved) reset(formValues)
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>{t('orders.details.customer.title')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstName"
            label={t('orders.details.customer.firstName')}
            maxLength={100}
            rules={{ validate: required }}
          />
          <FormField
            control={control}
            name="lastName"
            label={t('orders.details.customer.lastName')}
            maxLength={100}
            rules={{ validate: required }}
          />
          <FormField
            control={control}
            name="phone"
            label={t('orders.details.customer.phone')}
            type="tel"
            rules={{
              validate: (value) =>
                !value.trim()
                  ? t('orders.errors.required')
                  : PHONE_PATTERN.test(value.trim()) || t('orders.errors.phoneInvalid'),
            }}
          />
          <FormField
            control={control}
            name="email"
            label={t('orders.details.customer.email')}
            type="email"
            maxLength={255}
            rules={{
              validate: (value) =>
                !value.trim()
                  ? t('orders.errors.required')
                  : EMAIL_PATTERN.test(value.trim()) || t('orders.errors.emailInvalid'),
            }}
          />
        </div>
        <p className="text-sm text-ink">
          <span className="font-semibold text-accent">{t('orders.details.language')}: </span>
          {order.locale.toUpperCase()}
        </p>
      </section>

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>{t('orders.details.delivery.title')}</h2>
        <p className="text-sm text-ink">
          <span className="font-semibold text-accent">{t('orders.details.delivery.method')}: </span>
          {t(`orders.deliveryMethod.${order.deliveryMethod}`)}
        </p>
        <FormField
          control={control}
          name="deliveryCity"
          label={t('orders.details.delivery.city')}
          maxLength={200}
          rules={{ validate: (value) => !isDelivery || required(value) }}
        />
        <FormField
          control={control}
          name="deliveryAddress"
          label={
            isDelivery
              ? t('orders.details.delivery.address')
              : t('orders.details.delivery.pickupDetails')
          }
          rows={2}
          maxLength={1000}
          rules={{ validate: (value) => !isDelivery || required(value) }}
        />
      </section>

      <section className={cardClassName}>
        <div className="flex flex-col gap-1">
          <h2 className={cardTitleClassName}>{t('orders.details.adminComment.title')}</h2>
          <p className="text-xs text-ink">{t('orders.details.adminComment.hint')}</p>
        </div>
        <FormField
          control={control}
          name="adminComment"
          label={t('orders.details.adminComment.title')}
          srOnlyLabel
          rows={3}
          maxLength={2000}
          placeholder={t('orders.details.adminComment.placeholder')}
        />
      </section>

      {serverError ? <p className="text-sm text-danger">{serverError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        {!hasChanges ? (
          <p className="text-sm text-ink">{t('orders.details.noChanges')}</p>
        ) : null}
        <Button
          type="submit"
          isDisabled={isMutating || !hasChanges}
          className="h-10! rounded-lg! bg-accent! px-5! text-sm! font-semibold! text-white! shadow-none!"
        >
          {t('orders.details.save')}
        </Button>
      </div>
    </form>
  )
}
