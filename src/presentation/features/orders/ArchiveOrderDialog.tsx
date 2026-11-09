import { Button, Modal } from '@heroui/react'
import { useTranslation } from '../../../shared/i18n'

interface ArchiveOrderDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

export function ArchiveOrderDialog({ isOpen, onOpenChange, onConfirm }: ArchiveOrderDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          <Modal.Header>
            <Modal.Heading className="font-heading text-2xl font-bold text-accent">
              {t('orders.archive.dialog.title')}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="pt-4">
            <p className="text-sm text-ink">{t('orders.archive.dialog.message')}</p>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onPress={() => onOpenChange(false)}
              className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
            >
              {t('orders.archive.dialog.back')}
            </Button>
            <Button
              onPress={onConfirm}
              className="h-9! rounded-md! bg-accent! px-4! text-sm! font-semibold! text-white! shadow-none!"
            >
              {t('orders.archive.dialog.confirm')}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
