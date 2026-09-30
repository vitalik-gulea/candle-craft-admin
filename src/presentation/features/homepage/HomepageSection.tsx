import { Button } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { HOMEPAGE_MAX_ITEMS } from '../../../domain/homepage/types'
import { useTranslation } from '../../../shared/i18n'
import type { HomepageOption } from './homepage-types'
import { HomepagePickerModal } from './HomepagePickerModal'

interface HomepageSectionProps {
  title: string
  hint: string
  addLabel: string
  pickerTitle: string
  searchPlaceholder: string
  emptySlotLabel: string
  selected: HomepageOption[]
  available: HomepageOption[]
  isDisabled: boolean
  onChange: (ids: string[]) => void
}

const iconButtonClassName =
  'size-8 rounded-md border border-field-border bg-white p-1.5 text-accent shadow-none'

export function HomepageSection({
  title,
  hint,
  addLabel,
  pickerTitle,
  searchPlaceholder,
  emptySlotLabel,
  selected,
  available,
  isDisabled,
  onChange,
}: HomepageSectionProps) {
  const { t } = useTranslation()
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const ids = selected.map((item) => item.id)
  const freeSlots = Math.max(0, HOMEPAGE_MAX_ITEMS - selected.length)
  const options = available.filter((item) => !ids.includes(item.id))
  const emptySlots = Array.from({ length: freeSlots })

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    const next = [...ids]
    const moved = next[index]
    next[index] = next[target]
    next[target] = moved
    onChange(next)
  }

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg border border-field-border bg-white p-6">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold text-accent">{title}</h2>
            <span className="rounded-md bg-surface-soft px-2 py-1 text-xs font-semibold text-accent">
              {selected.length} / {HOMEPAGE_MAX_ITEMS}
            </span>
          </div>
          <p className="text-sm text-ink">{hint}</p>
        </div>
        <Button
          variant="outline"
          isDisabled={isDisabled || freeSlots === 0 || options.length === 0}
          onPress={() => setIsPickerOpen(true)}
          className="h-9! shrink-0 rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
        >
          <svg className="size-4" aria-hidden="true">
            <use href="#plus-icon" />
          </svg>
          {addLabel}
        </Button>
      </div>

      <div className="flex w-full flex-col gap-2">
        <AnimatePresence initial={false}>
          {selected.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex w-full items-center gap-4 rounded-xl border border-field-border bg-white p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-sm font-bold text-white">
                {index + 1}
              </span>
              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-surface-soft">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted">
                    <svg className="size-5" aria-hidden="true">
                      <use href="#image-icon" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-heading text-base font-bold text-accent">
                  {item.title}
                </p>
                <p className="truncate text-sm text-ink">{item.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  isDisabled={isDisabled || index === 0}
                  aria-label={t('homepage.moveUp')}
                  onPress={() => move(index, -1)}
                  className={iconButtonClassName}
                >
                  <svg className="size-4 rotate-180" aria-hidden="true">
                    <use href="#chevron-down-icon" />
                  </svg>
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  isDisabled={isDisabled || index === selected.length - 1}
                  aria-label={t('homepage.moveDown')}
                  onPress={() => move(index, 1)}
                  className={iconButtonClassName}
                >
                  <svg className="size-4" aria-hidden="true">
                    <use href="#chevron-down-icon" />
                  </svg>
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  isDisabled={isDisabled}
                  aria-label={t('homepage.remove')}
                  onPress={() => onChange(ids.filter((id) => id !== item.id))}
                  className={`${iconButtonClassName} text-danger`}
                >
                  <svg className="size-4" aria-hidden="true">
                    <use href="#trash-icon" />
                  </svg>
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {emptySlots.map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            disabled={isDisabled || options.length === 0}
            onClick={() => setIsPickerOpen(true)}
            className="flex h-[82px] w-full items-center gap-4 rounded-xl border border-dashed border-field-border bg-surface-soft px-3 text-left disabled:opacity-60"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-field-border bg-white font-heading text-sm font-bold text-muted">
              {selected.length + index + 1}
            </span>
            <span className="text-sm font-semibold text-muted">{emptySlotLabel}</span>
          </button>
        ))}
      </div>

      <HomepagePickerModal
        isOpen={isPickerOpen}
        title={pickerTitle}
        searchPlaceholder={searchPlaceholder}
        options={options}
        maxSelectable={freeSlots}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={(picked) => {
          onChange([...ids, ...picked])
          setIsPickerOpen(false)
        }}
      />
    </section>
  )
}
