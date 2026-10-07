import { Button, Modal } from '@heroui/react'
import type { CategoryTreeNode } from '../../../domain/categories/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface DeleteCategoryBranchModalProps {
  category: CategoryTreeNode | null
  locale: Locale
  isPending: boolean
  onClose: () => void
  onConfirm: (category: CategoryTreeNode) => void
}

export function DeleteCategoryBranchModal({
  category,
  locale,
  isPending,
  onClose,
  onConfirm,
}: DeleteCategoryBranchModalProps) {
  const { t } = useTranslation()

  return (
    <Modal.Backdrop
      isOpen={category !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
          {category ? (
            <>
              <Modal.Header>
                <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                  {t('categories.deleteWithChildren.title')}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="pt-4">
                <p className="text-sm text-ink">
                  {t('categories.deleteWithChildren.message', { name: category.name[locale] })}
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
                  onPress={() => onConfirm(category)}
                  className="h-9! rounded-md! bg-danger! px-4! text-sm! font-semibold! text-white! shadow-none!"
                >
                  {t('categories.deleteWithChildren.confirm')}
                </Button>
              </Modal.Footer>
            </>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
