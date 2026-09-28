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
              <use href="/icons.svg#mail-icon" />
            </svg>
          </InputGroup.Prefix>
          <InputGroup.Input
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
              <use href="/icons.svg#lock-icon" />
            </svg>
          </InputGroup.Prefix>
          <InputGroup.Input
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('auth.login.passwordPlaceholder')}
            {...register('password', {
              required: t('auth.login.errors.passwordRequired'),
            })}
          />
          <InputGroup.Suffix>
            <button
              type="button"
              className="text-sm font-semibold text-accent hover:text-accent-hover"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            >
              {isPasswordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
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
