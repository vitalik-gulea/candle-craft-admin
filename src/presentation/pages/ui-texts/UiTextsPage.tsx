import { Button, SearchField, Spinner, toast } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { LocalizedString } from '../../../domain/shared/localized'
import { isValidUiTextValue } from '../../../domain/ui-texts/placeholders'
import { useTranslation } from '../../../shared/i18n'
import { groupUiTexts } from '../../features/ui-texts/ui-text-groups'
import { UiTextRow } from '../../features/ui-texts/UiTextRow'
import { useUiTextsStore } from '../../stores/ui-texts.store'

function isSame(a: LocalizedString, b: LocalizedString): boolean {
  return a.ro === b.ro && a.ru === b.ru
}

export function UiTextsPage() {
  const { t } = useTranslation()
  const items = useUiTextsStore((state) => state.items)
  const isLoading = useUiTextsStore((state) => state.isLoading)
  const isSaving = useUiTextsStore((state) => state.isSaving)
  const hasLoadError = useUiTextsStore((state) => state.hasLoadError)
  const load = useUiTextsStore((state) => state.load)
  const save = useUiTextsStore((state) => state.save)
  const reset = useUiTextsStore((state) => state.reset)

  const [drafts, setDrafts] = useState<Record<string, LocalizedString>>({})
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  const groups = useMemo(() => groupUiTexts(items), [items])
  const savedByKey = useMemo(() => new Map(items.map((item) => [item.key, item.value])), [items])

  const defaultsByKey = useMemo(
    () => new Map(items.map((item) => [item.key, item.defaultValue])),
    [items],
  )

  const changedKeys = useMemo(
    () =>
      Object.keys(drafts).filter((key) => {
        const saved = savedByKey.get(key)
        return saved !== undefined && !isSame(saved, drafts[key])
      }),
    [drafts, savedByKey],
  )
  const changedSet = useMemo(() => new Set(changedKeys), [changedKeys])
  const isDirty = changedKeys.length > 0

  const query = search.trim().toLowerCase()
  const section = groups.some((group) => group.section === activeSection)
    ? activeSection
    : (groups[0]?.section ?? null)

  const visibleGroups = useMemo(() => {
    if (query === '') return groups.filter((group) => group.section === section)
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const value = drafts[item.key] ?? item.value
          return (
            item.key.toLowerCase().includes(query) ||
            value.ro.toLowerCase().includes(query) ||
            value.ru.toLowerCase().includes(query)
          )
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, section, query, drafts])

  function handleChange(key: string, value: LocalizedString) {
    setDrafts((current) => ({ ...current, [key]: value }))
  }

  function handleResetRow(key: string) {
    setDrafts((current) => {
      const { [key]: _removed, ...rest } = current
      return rest
    })
  }

  function handleResetAll() {
    setDrafts({})
    setShowErrors(false)
  }

  async function handleSave() {
    const updates = changedKeys.map((key) => ({ key, value: drafts[key] }))
    const hasInvalid = updates.some((update) => {
      const defaults = defaultsByKey.get(update.key)
      return (
        defaults === undefined ||
        !isValidUiTextValue(update.value.ro, defaults.ro) ||
        !isValidUiTextValue(update.value.ru, defaults.ru)
      )
    })
    if (hasInvalid) {
      setShowErrors(true)
      toast.danger(t('uiTexts.errors.invalid'))
      return
    }

    const trimmed = updates.map((update) => ({
      key: update.key,
      value: { ro: update.value.ro.trim(), ru: update.value.ru.trim() },
    }))
    const result = await save(trimmed)
    if (result.status === 'ok') {
      setDrafts({})
      setShowErrors(false)
      toast.success(t('uiTexts.toasts.saved'))
      return
    }

    const details = Array.isArray(result.details) ? result.details.join(', ') : result.details
    toast.danger(details ?? getErrorMessage(result.code))
  }

  function getErrorMessage(code: string) {
    if (code === 'FORBIDDEN') return t('uiTexts.errors.forbidden')
    if (code === 'NOT_FOUND') return t('uiTexts.errors.notFound')
    return t('uiTexts.errors.unknown')
  }

  async function handleRestoreDefault(key: string) {
    const result = await reset(key)
    if (result.status === 'ok') {
      toast.success(t('uiTexts.toasts.restored'))
      return
    }
    const details = Array.isArray(result.details) ? result.details.join(', ') : result.details
    toast.danger(details ?? getErrorMessage(result.code))
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
          <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.uiTexts')}</h1>
          <p className="text-sm text-muted">{t('uiTexts.subtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isDirty ? (
            <p className="text-sm font-semibold text-ink">
              {t('uiTexts.changedCount', { count: String(changedKeys.length) })}
            </p>
          ) : null}
          <Button
            variant="outline"
            isDisabled={!isDirty || isSaving}
            onPress={handleResetAll}
            className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
          >
            {t('uiTexts.actions.reset')}
          </Button>
          <Button
            isDisabled={!isDirty}
            isPending={isSaving}
            onPress={() => void handleSave()}
            className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : hasLoadError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-field-border bg-white">
          <p className="text-sm text-ink">{t('uiTexts.errors.load')}</p>
          <Button
            variant="outline"
            onPress={() => void load()}
            className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <div className="flex w-full items-start gap-6">
          <nav className="sticky top-6 flex w-[220px] shrink-0 flex-col gap-1 rounded-xl border border-field-border bg-white p-2">
            {groups.map((group) => {
              const isActive = query === '' && group.section === section
              const changedInGroup = group.items.filter((item) => changedSet.has(item.key)).length
              return (
                <button
                  key={group.section}
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setActiveSection(group.section)
                  }}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-accent font-semibold text-white'
                      : 'font-medium text-accent hover:bg-surface-soft'
                  }`}
                >
                  <span className="truncate">{t(`uiTexts.sections.${group.section}`)}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {changedInGroup > 0 ? (
                      <span
                        className={`size-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-accent'}`}
                      />
                    ) : null}
                    <span className={`text-xs ${isActive ? 'text-white/80' : 'text-muted'}`}>
                      {group.items.length}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <SearchField
              value={search}
              onChange={setSearch}
              aria-label={t('common.search')}
              className="w-full max-w-[420px]"
            >
              <SearchField.Group className="rounded-md border border-field-border bg-white px-3 py-2">
                <SearchField.SearchIcon>
                  <svg className="size-3.5 text-muted" aria-hidden="true">
                    <use href="#search-icon" />
                  </svg>
                </SearchField.SearchIcon>
                <SearchField.Input
                  placeholder={t('uiTexts.searchPlaceholder')}
                  className="text-sm text-accent placeholder:text-muted"
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            {visibleGroups.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-field-border bg-white">
                <p className="text-sm text-muted">{t('common.empty')}</p>
              </div>
            ) : (
              visibleGroups.map((group) => (
                <section key={group.section} className="flex flex-col gap-3">
                  <h2 className="font-heading text-xl font-bold text-accent">
                    {t(`uiTexts.sections.${group.section}`)}
                  </h2>
                  {group.items.map((item) => (
                    <UiTextRow
                      key={item.key}
                      textKey={item.key}
                      value={drafts[item.key] ?? item.value}
                      defaultValue={item.defaultValue}
                      isChanged={changedSet.has(item.key)}
                      isCustomized={item.isCustomized}
                      isDisabled={isSaving}
                      showErrors={showErrors}
                      onChange={(value) => handleChange(item.key, value)}
                      onReset={() => handleResetRow(item.key)}
                      onRestoreDefault={() => void handleRestoreDefault(item.key)}
                    />
                  ))}
                </section>
              ))
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
