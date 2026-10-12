import { Alert, Button, Input, Label, ListBox, Select, TextField } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { INVITABLE_ROLES, type Invitation, type UserRole } from '../../../domain/auth/types'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import { useInvitationsStore } from '../../stores/invitations.store'

interface InviteUserFormValues {
  email: string
  fullName: string
  role: UserRole
}

type InviteError = 'conflict' | 'validation' | 'forbidden' | 'unknown'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const labelClassName = 'text-sm font-semibold text-accent'

export function InviteUserForm() {
  const { t, locale } = useTranslation()
  const invite = useInvitationsStore((state) => state.invite)
  const isInviting = useInvitationsStore((state) => state.isInviting)
  const [sent, setSent] = useState<Invitation | null>(null)
  const [error, setError] = useState<InviteError | null>(null)
  const [details, setDetails] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    mode: 'onTouched',
    defaultValues: { email: '', fullName: '', role: 'manager' },
  })

  const submit = handleSubmit(async (values) => {
    setSent(null)
    setError(null)
    setDetails(null)
    const result = await invite({
      email: values.email.trim(),
      fullName: values.fullName.trim(),
      role: values.role,
    })
    if (!('code' in result)) {
      setSent(result)
      reset({ email: '', fullName: '', role: values.role })
      return
    }
    if (result.code === 'CONFLICT') setError('conflict')
    else if (result.code === 'VALIDATION') {
      setError('validation')
      setDetails(Array.isArray(result.details) ? result.details.join(', ') : result.details)
    } else if (result.code === 'FORBIDDEN') setError('forbidden')
    else setError('unknown')
  })

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex w-full max-w-xl flex-col gap-5 rounded-xl border border-field-border bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold text-accent">{t('users.invite.title')}</h2>
        <p className="text-xs text-ink">{t('users.invite.hint')}</p>
      </div>

      <AnimatePresence>
        {sent ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Alert status="success">
              <Alert.Content>
                <Alert.Description>
                  {t('users.invite.sent', {
                    email: sent.email,
                    expiresAt: formatChisinauDateTime(sent.expiresAt, locale),
                  })}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
        {error ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>
                  {error === 'validation' && details
                    ? details
                    : t(`users.invite.errors.${error}`)}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TextField name="email" isInvalid={!!errors.email} className="flex flex-col gap-2">
        <Label className={labelClassName}>{t('users.invite.email')}</Label>
        <Input
          fullWidth
          type="email"
          maxLength={255}
          {...register('email', {
            required: t('users.invite.errors.emailRequired'),
            pattern: { value: EMAIL_PATTERN, message: t('auth.login.errors.emailInvalid') },
          })}
        />
        {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
      </TextField>

      <TextField name="fullName" isInvalid={!!errors.fullName} className="flex flex-col gap-2">
        <Label className={labelClassName}>{t('users.invite.fullName')}</Label>
        <Input
          fullWidth
          maxLength={150}
          {...register('fullName', {
            validate: (value) => value.trim().length > 0 || t('users.invite.errors.nameRequired'),
          })}
        />
        {errors.fullName ? <p className="text-xs text-danger">{errors.fullName.message}</p> : null}
      </TextField>

      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <Select
            selectedKey={field.value}
            onSelectionChange={(key) => key && field.onChange(String(key))}
            aria-label={t('users.invite.role')}
            className="flex flex-col gap-2"
          >
            <Label className={labelClassName}>{t('users.invite.role')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {INVITABLE_ROLES.map((role) => (
                  <ListBox.Item key={role} id={role} textValue={t(`sidebar.roles.${role}`)}>
                    {t(`sidebar.roles.${role}`)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          isPending={isInviting}
          isDisabled={isInviting}
          className="h-10! rounded-lg! bg-accent! px-5! text-sm! font-semibold! text-white! shadow-none!"
        >
          {t('users.invite.submit')}
        </Button>
      </div>
    </form>
  )
}
