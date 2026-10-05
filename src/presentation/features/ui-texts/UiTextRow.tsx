import { Button, TextArea } from '@heroui/react'
import type { LocalizedString } from '../../../domain/shared/localized'
import { isValidUiTextValue } from '../../../domain/ui-texts/placeholders'
import { useTranslation } from '../../../shared/i18n'

interface UiTextRowProps {
  textKey: string
  value: LocalizedString
  defaultValue: LocalizedString
  isChanged: boolean
  isCustomized: boolean
  isDisabled: boolean
  showErrors: boolean
  onChange: (value: LocalizedString) => void
  onReset: () => void
  onRestoreDefault: () => void
}

function getRows(value: string): number {
  if (value.length > 160) return 4
  if (value.length > 70) return 3
  return 2
}

const ACTION_BUTTON_CLASS =
  'h-7! rounded-md! border-field-border! bg-white! px-3! text-xs! font-semibold! text-accent! shadow-none!'

export function UiTextRow({
  textKey,
  value,
  defaultValue,
  isChanged,
  isCustomized,
  isDisabled,
  showErrors,
  onChange,
  onReset,
  onRestoreDefault,
}: UiTextRowProps) {
  const { t } = useTranslation()
  const rows = Math.max(getRows(value.ro), getRows(value.ru))

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
        isChanged ? 'border-accent bg-surface-soft' : 'border-field-border bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <code className="truncate text-xs font-semibold text-muted">{textKey}</code>
          {isCustomized ? (
            <span className="shrink-0 rounded-md bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              {t('uiTexts.customized')}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isChanged ? (
            <Button
              variant="outline"
              isDisabled={isDisabled}
              onPress={onReset}
              className={ACTION_BUTTON_CLASS}
            >
              {t('uiTexts.actions.resetRow')}
            </Button>
          ) : null}
          {isCustomized && !isChanged ? (
            <Button
              variant="outline"
              isDisabled={isDisabled}
              onPress={onRestoreDefault}
              className={ACTION_BUTTON_CLASS}
            >
              {t('uiTexts.actions.restoreDefault')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {(['ro', 'ru'] as const).map((lang) => {
          const isInvalid = showErrors && !isValidUiTextValue(value[lang], defaultValue[lang])
          return (
            <div key={lang} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-accent">{lang.toUpperCase()}</span>
              <TextArea
                fullWidth
                rows={rows}
                aria-label={`${textKey} ${lang.toUpperCase()}`}
                value={value[lang]}
                disabled={isDisabled}
                aria-invalid={isInvalid}
                onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
