import { Alert, Button, Form, Input, Label, Spinner, TextField } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MIN_PASSWORD_LENGTH } from '../../../domain/auth/types'
import { useTranslation } from '../../../shared/i18n'
import { useAuthStore } from '../../stores/auth.store'
import { useInvitationsStore } from '../../stores/invitations.store'

interface AcceptInviteFormValues {
  password: string
  passwordConfirm: string
}

type SubmitError = 'conflict' | 'invalid' | 'validation' | 'unknown'

export function AcceptInvitePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const preview = useInvitationsStore((state) => state.preview)
  const previewStatus = useInvitationsStore((state) => state.previewStatus)
  const loadPreview = useInvitationsStore((state) => state.loadPreview)
  const acceptInvitation = useAuthStore((state) => state.acceptInvitation)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const [submitError, setSubmitError] = useState<SubmitError | null>(null)
  const [submitDetails, setSubmitDetails] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AcceptInviteFormValues>({
    mode: 'onTouched',
    defaultValues: { password: '', passwordConfirm: '' },
  })

  useEffect(() => {
    if (token) void loadPreview(token)
  }, [token, loadPreview])

  const isInvalid = !token || previewStatus === 'invalid'
  const isLoading = !isInvalid && (previewStatus === 'idle' || previewStatus === 'loading')

  const submit = handleSubmit(async (values) => {
    if (!token) return
    setSubmitError(null)
    setSubmitDetails(null)
    const error = await acceptInvitation(token, values.password)
    if (!error) {
      window.history.replaceState(null, '', window.location.pathname)
      navigate('/', { replace: true })
      return
    }
    if (error.code === 'CONFLICT') setSubmitError('conflict')
    else if (error.code === 'INVALID_INVITATION') {
      const details = Array.isArray(error.details) ? error.details.join(', ') : error.details
      setSubmitError(details ? 'validation' : 'invalid')
      setSubmitDetails(details)
    } else setSubmitError('unknown')
  })

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex w-full max-w-md flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold text-accent">
            {t('auth.invitation.title')}
          </h1>
          {preview ? (
            <p className="text-base text-accent">
              {t('auth.invitation.greeting', {
                fullName: preview.fullName,
                role: t(`sidebar.roles.${preview.role}`),
              })}
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : null}

        {isInvalid || submitError === 'invalid' ? (
          <div className="flex flex-col gap-4">
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>{t('auth.invitation.invalid')}</Alert.Description>
              </Alert.Content>
            </Alert>
            <Link to="/login" className="text-sm font-semibold text-accent hover:underline">
              {t('auth.invitation.goToLogin')}
            </Link>
          </div>
        ) : null}

        {previewStatus === 'error' && !isInvalid ? (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Description>{t('auth.invitation.errors.unknown')}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        {preview && submitError !== 'invalid' ? (
          <Form onSubmit={submit} validationBehavior="aria" className="flex w-full flex-col gap-5">
            {submitError === 'conflict' ? (
              <Alert status="danger">
                <Alert.Content>
                  <Alert.Description>{t('auth.invitation.conflict')}</Alert.Description>
                  <Link to="/login" className="text-sm font-semibold text-accent hover:underline">
                    {t('auth.invitation.goToLogin')}
                  </Link>
                </Alert.Content>
              </Alert>
            ) : null}
            {submitError === 'validation' || submitError === 'unknown' ? (
              <Alert status="danger">
                <Alert.Content>
                  <Alert.Description>
                    {submitError === 'validation' && submitDetails
                      ? submitDetails
                      : t('auth.invitation.errors.unknown')}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            <TextField name="email" isReadOnly className="flex w-full flex-col gap-2">
              <Label className="text-xs font-bold uppercase text-accent">
                {t('auth.login.emailLabel')}
              </Label>
              <Input fullWidth value={preview.email} readOnly />
            </TextField>

            <TextField
              name="password"
              type="password"
              isInvalid={!!errors.password}
              className="flex w-full flex-col gap-2"
            >
              <Label className="text-xs font-bold uppercase text-accent">
                {t('auth.invitation.passwordLabel')}
              </Label>
              <Input
                fullWidth
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.invitation.passwordPlaceholder')}
                {...register('password', {
                  required: t('auth.login.errors.passwordRequired'),
                  minLength: {
                    value: MIN_PASSWORD_LENGTH,
                    message: t('auth.invitation.errors.passwordTooShort', {
                      count: String(MIN_PASSWORD_LENGTH),
                    }),
                  },
                })}
              />
              {errors.password ? (
                <p className="text-xs text-danger">{errors.password.message}</p>
              ) : null}
            </TextField>

            <TextField
              name="passwordConfirm"
              type="password"
              isInvalid={!!errors.passwordConfirm}
              className="flex w-full flex-col gap-2"
            >
              <Label className="text-xs font-bold uppercase text-accent">
                {t('auth.invitation.confirmLabel')}
              </Label>
              <Input
                fullWidth
                type="password"
                autoComplete="new-password"
                {...register('passwordConfirm', {
                  required: t('auth.login.errors.passwordRequired'),
                  validate: (value) =>
                    value === getValues('password') || t('auth.invitation.errors.passwordMismatch'),
                })}
              />
              {errors.passwordConfirm ? (
                <p className="text-xs text-danger">{errors.passwordConfirm.message}</p>
              ) : null}
            </TextField>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isPending={isSubmitting}
              isDisabled={isSubmitting}
              className="rounded-xl"
            >
              {t('auth.invitation.submit')}
            </Button>
          </Form>
        ) : null}
      </motion.div>
    </div>
  )
}
