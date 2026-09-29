import { Button, Checkbox, Label, Modal, SearchField } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../shared/i18n'
import type { HomepageOption } from './homepage-types'

interface HomepagePickerModalProps {
  isOpen: boolean
  title: string
  searchPlaceholder: string
  options: HomepageOption[]
  maxSelectable: number
  onClose: () => void
  onConfirm: (ids: string[]) => void
}

export function HomepagePickerModal({
  isOpen,
  title,
  searchPlaceholder,
  options,
  maxSelectable,
  onClose,
  onConfirm,
}: HomepagePickerModalProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return
    setSearch('')
    setSelected([])
  }, [isOpen])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) =>
      `${option.title} ${option.subtitle}`.toLowerCase().includes(query),
    )
  }, [options, search])

  const isLimitReached = selected.length >= maxSelectable

  function toggle(id: string, isSelected: boolean) {
    setSelected((prev) => {
      if (!isSelected) return prev.filter((item) => item !== id)
      if (prev.length >= maxSelectable) return prev
      return [...prev, id]
    })
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-lg rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          <Modal.Header>
            <Modal.Heading className="font-heading text-2xl font-bold text-accent">
              {title}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4 pt-4">
            <SearchField
              value={search}
              onChange={setSearch}
              aria-label={t('common.search')}
              className="group w-full"
            >
              <SearchField.Group className="h-[38px]! w-full! items-center! gap-2! overflow-hidden! rounded-[6px]! border! border-field-border! bg-surface-soft! px-3! py-2! shadow-none!">
                <SearchField.SearchIcon className="pointer-events-none ms-0! me-0! size-[14px]! h-[14px]! w-[14px]! shrink-0! text-muted!">
                  <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
                    <use href="/icons.svg#filter-search-icon" />
                  </svg>
                </SearchField.SearchIcon>
                <SearchField.Input
                  placeholder={searchPlaceholder}
                  className="min-w-0! flex-1! bg-transparent! px-0! py-0! ps-0! pe-0! text-sm! font-normal! leading-[18px]! text-accent! outline-none! placeholder:text-muted!"
                />
                <SearchField.ClearButton className="me-0! size-4! group-data-[empty=true]:hidden!" />
              </SearchField.Group>
            </SearchField>

            <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink">{t('common.empty')}</p>
              ) : (
                filtered.map((option) => {
                  const isSelected = selected.includes(option.id)
                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 rounded-md border border-field-border px-3 py-2"
                    >
                      <Checkbox
                        isSelected={isSelected}
                        isDisabled={!isSelected && isLimitReached}
                        onChange={(value) => toggle(option.id, value)}
                        aria-label={option.title}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Label className="sr-only">{option.title}</Label>
                        </Checkbox.Content>
                      </Checkbox>
                      <div className="size-10 shrink-0 overflow-hidden rounded-md bg-surface-soft">
                        {option.imageUrl ? (
                          <img src={option.imageUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted">
                            <svg className="size-4" aria-hidden="true">
                              <use href="/icons.svg#image-icon" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-sm font-semibold text-accent">{option.title}</p>
                        <p className="truncate text-xs text-ink">{option.subtitle}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex items-center justify-between gap-3 pt-6">
            <p className="text-sm font-semibold text-muted">
              {t('homepage.picker.selected', {
                count: String(selected.length),
                max: String(maxSelectable),
              })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onPress={onClose}
                className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
              >
                {t('common.cancel')}
              </Button>
              <Button
                isDisabled={selected.length === 0}
                onPress={() => onConfirm(selected)}
                className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
              >
                {t('homepage.picker.add')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
