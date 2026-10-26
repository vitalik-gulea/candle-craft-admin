import { Button, Modal } from '@heroui/react'
import type { NavigationItem } from '../../../domain/navigation/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface DeleteNavigationItemModalProps {
  item: NavigationItem | null
  locale: Locale
  isPending: boolean
  onClose: () => void
  onConfirm: (item: NavigationItem) => void
}

export function DeleteNavigationItemModal({
  item,
  locale,
  isPending,
  onClose,
  onConfirm,
}: DeleteNavigationItemModalProps) {
  const { t } = useTranslation()

  return (
    <Modal.Backdrop
      isOpen={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          {item ? (
            <>
              <Modal.Header>
                <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                  {t('navigation.delete.title')}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="pt-4">
                <p className="text-sm text-ink">
                  {t('navigation.delete.message', { name: item.label[locale] })}
                </p>
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  isDisabled={isPending}
                  onPress={onClose}
                  className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  isDisabled={isPending}
                  onPress={() => onConfirm(item)}
                  className="h-9! rounded-md! bg-danger! px-4! text-sm! font-semibold! text-white! shadow-none!"
                >
                  {t('navigation.delete.confirm')}
                </Button>
              </Modal.Footer>
            </>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
