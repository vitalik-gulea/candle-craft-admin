import { Alert, Button, Input, Label, Spinner, toast } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { uploadImageUseCase } from '../../../application/uploads/upload-image.use-case'
import { uploadsApi } from '../../../infrastructure/uploads/uploads.api'
import { useTranslation } from '../../../shared/i18n'
import { useSettingsStore } from '../../stores/settings.store'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const THRESHOLD_PATTERN = /^\d+(\.\d{1,2})?$/

export function SettingsPage() {
  const { t, locale } = useTranslation()
  const settings = useSettingsStore((state) => state.settings)
  const isLoading = useSettingsStore((state) => state.isLoading)
  const isSaving = useSettingsStore((state) => state.isSaving)
  const errorCode = useSettingsStore((state) => state.errorCode)
  const errorDetails = useSettingsStore((state) => state.errorDetails)
  const load = useSettingsStore((state) => state.load)
  const save = useSettingsStore((state) => state.save)
  const clearError = useSettingsStore((state) => state.clearError)

  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState('')
  const [thresholdError, setThresholdError] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (settings) setThreshold(settings.freeDeliveryThreshold ?? '')
  }, [settings])

  const details = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails
  const loadError =
    errorCode && !settings
      ? errorCode === 'FORBIDDEN'
        ? t('settings.errors.forbidden')
        : t('settings.errors.load')
      : null
  const saveError =
    errorCode && settings
      ? details ||
        (errorCode === 'FORBIDDEN'
          ? t('settings.errors.forbidden')
          : errorCode === 'VALIDATION'
            ? t('settings.errors.validation')
            : t('settings.errors.unknown'))
      : null

  const normalizedThreshold = threshold.trim().replace(',', '.')
  const isThresholdDirty = normalizedThreshold !== (settings?.freeDeliveryThreshold ?? '')

  async function handleUploadHero(file: File) {
    setHeroError(null)
    clearError()
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setHeroError(t('settings.errors.imageType'))
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setHeroError(t('settings.errors.imageSize'))
      return
    }

    setIsUploadingHero(true)
    try {
      const uploaded = await uploadImageUseCase(uploadsApi, file)
      const saved = await save({ heroImageUrl: uploaded.url, heroImageKey: uploaded.key })
      if (saved) toast.success(t('settings.toasts.heroSaved'))
    } catch {
      setHeroError(t('settings.errors.upload'))
    } finally {
      setIsUploadingHero(false)
    }
  }

  async function handleRemoveHero() {
    setHeroError(null)
    clearError()
    const saved = await save({ heroImageUrl: null, heroImageKey: null })
    if (saved) toast.success(t('settings.toasts.heroRemoved'))
  }

  async function handleSaveThreshold() {
    clearError()
    if (normalizedThreshold !== '' && !THRESHOLD_PATTERN.test(normalizedThreshold)) {
      setThresholdError(t('settings.errors.threshold'))
      return
    }
    setThresholdError(null)
    const saved = await save({ freeDeliveryThreshold: normalizedThreshold || null })
    if (saved) toast.success(t('settings.toasts.deliverySaved'))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.settings')}</h1>
          <p className="text-sm text-muted">{t('settings.subtitle')}</p>
        </div>
        {settings ? (
          <p className="shrink-0 text-[13px] text-muted">
            {t('settings.updatedAt', {
              date: new Date(settings.updatedAt).toLocaleString(
                locale === 'ro' ? 'ro-RO' : 'ru-RU',
              ),
            })}
          </p>
        ) : null}
      </div>

      {isLoading && !settings ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : loadError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-field-border bg-white">
          <p className="text-sm text-ink">{loadError}</p>
          <Button
            variant="outline"
            onPress={() => void load()}
            className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : settings ? (
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <AnimatePresence>
            {saveError ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <Alert status="danger">
                  <Alert.Content>
                    <Alert.Description>{saveError}</Alert.Description>
                  </Alert.Content>
                </Alert>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <section className="flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6">
            <h2 className="font-heading text-xl font-bold text-accent">
              {t('settings.hero.title')}
            </h2>

            {settings.heroImageUrl ? (
              <img
                src={settings.heroImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-56 w-full max-w-xl rounded-lg border border-field-border object-cover"
              />
            ) : (
              <div className="flex h-56 w-full max-w-xl items-center justify-center rounded-lg border border-dashed border-field-border bg-surface-soft text-sm text-muted">
                {t('settings.hero.notSet')}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label
                className={`flex h-9 items-center rounded-md bg-accent px-4 text-sm font-semibold text-white ${
                  isUploadingHero || isSaving ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                }`}
              >
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleUploadHero(file)
                    event.target.value = ''
                  }}
                />
                {isUploadingHero ? t('settings.hero.uploading') : t('settings.hero.upload')}
              </label>
              {settings.heroImageUrl ? (
                <Button
                  variant="outline"
                  isDisabled={isUploadingHero || isSaving}
                  onPress={() => void handleRemoveHero()}
                  className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-danger! shadow-none!"
                >
                  {t('settings.hero.remove')}
                </Button>
              ) : null}
            </div>
            <p className="text-xs leading-snug text-muted">{t('settings.hero.hint')}</p>
            {heroError ? <p className="text-xs text-danger">{heroError}</p> : null}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6">
            <h2 className="font-heading text-xl font-bold text-accent">
              {t('settings.delivery.title')}
            </h2>
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-semibold text-accent">
                {t('settings.delivery.label')}
              </Label>
              <Input
                fullWidth
                inputMode="decimal"
                maxLength={12}
                placeholder={t('settings.delivery.placeholder')}
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                aria-invalid={thresholdError ? true : undefined}
              />
              {thresholdError ? (
                <p className="text-xs text-danger">{thresholdError}</p>
              ) : (
                <p className="text-xs leading-snug text-muted">{t('settings.delivery.hint')}</p>
              )}
            </div>
            <div>
              <Button
                isDisabled={!isThresholdDirty}
                isPending={isSaving && !isUploadingHero}
                onPress={() => void handleSaveThreshold()}
                className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
              >
                {t('common.save')}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </motion.div>
  )
}
