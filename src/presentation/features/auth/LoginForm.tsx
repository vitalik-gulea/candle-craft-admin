import {
  Alert,
  Button,
  Checkbox,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from '@heroui/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../shared/i18n'
import { useAuthStore } from '../../stores/auth.store'

export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const loginInputClassName =
  'min-w-0! ps-0! pe-3! [&::-ms-clear]:hidden! [&::-ms-reveal]:hidden!'

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9.9 5.2A10.4 10.4 0 0 1 12 5c5.2 0 9.2 4.2 10.2 7a12.6 12.6 0 0 1-2.2 3.4M6.2 6.3C4.3 7.7 2.9 9.6 1.8 12c1 2.6 5 7 10.2 7 1.5 0 2.9-.4 4.2-1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 10.6a2 2 0 0 0 2.9 2.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const errorCode = useAuthStore((state) => state.errorCode)
  const clearError = useAuthStore((state) => state.clearError)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const validationErrors: Record<string, string> = {}
  if (errors.email?.message) validationErrors.email = errors.email.message
  if (errors.password?.message) validationErrors.password = errors.password.message

  const serverError =
    errorCode === 'INVALID_CREDENTIALS'
      ? t('auth.login.errors.invalidCredentials')
      : errorCode === 'UNKNOWN'
        ? t('auth.login.errors.unknown')
        : null

  return (
    <Form
      validationBehavior="aria"
      validationErrors={validationErrors}
      onSubmit={handleSubmit(async (values) => {
        clearError()
        const ok = await login(
          { email: values.email, password: values.password },
          values.rememberMe,
        )
        if (ok) navigate('/', { replace: true })
      })}
      className="flex w-full flex-col gap-5"
    >
      {serverError ? (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{serverError}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <TextField name="email" isInvalid={!!errors.email} className="flex w-full flex-col gap-2">
        <Label className="text-xs font-bold uppercase text-accent">
          {t('auth.login.emailLabel')}
        </Label>
        <InputGroup fullWidth className="h-12 rounded-xl">
          <InputGroup.Prefix>
            <svg className="size-5" aria-hidden="true">
              <use href="#mail-icon" />
            </svg>
          </InputGroup.Prefix>
          <InputGroup.Input
            className={loginInputClassName}
            type="email"
            autoComplete="email"
            placeholder={t('auth.login.emailPlaceholder')}
            {...register('email', {
              required: t('auth.login.errors.emailRequired'),
              pattern: {
                value: EMAIL_PATTERN,
                message: t('auth.login.errors.emailInvalid'),
              },
            })}
          />
        </InputGroup>
        <FieldError />
      </TextField>

      <TextField
        name="password"
        isInvalid={!!errors.password}
        className="flex w-full flex-col gap-2"
      >
        <Label className="text-xs font-bold uppercase text-accent">
          {t('auth.login.passwordLabel')}
        </Label>
        <InputGroup fullWidth className="h-12 rounded-xl">
          <InputGroup.Prefix>
            <svg className="size-5" aria-hidden="true">
              <use href="#lock-icon" />
            </svg>
          </InputGroup.Prefix>
          <InputGroup.Input
            className={`${loginInputClassName} pe-0!`}
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('auth.login.passwordPlaceholder')}
            {...register('password', {
              required: t('auth.login.errors.passwordRequired'),
            })}
          />
          <InputGroup.Suffix className="px-3!">
            <button
              type="button"
              className="flex size-5 items-center justify-center text-accent hover:text-accent-hover"
              aria-label={
                isPasswordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')
              }
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            >
              <PasswordVisibilityIcon visible={isPasswordVisible} />
            </button>
          </InputGroup.Suffix>
        </InputGroup>
        <FieldError />
      </TextField>

      <Controller
        control={control}
        name="rememberMe"
        render={({ field: { value, onChange, name } }) => (
          <Checkbox isSelected={value} onChange={onChange} name={name}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label className="text-sm text-accent">{t('auth.login.rememberMe')}</Label>
            </Checkbox.Content>
          </Checkbox>
        )}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        isPending={isSubmitting}
        isDisabled={isSubmitting}
        className="rounded-xl"
      >
        {t('auth.login.submit')}
      </Button>
    </Form>
  )
}
