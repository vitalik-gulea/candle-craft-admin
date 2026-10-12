import { Button, Modal } from '@heroui/react'
import { useState } from 'react'
import {
  getAvailableStatusActions,
  type OrderStatusAction,
} from '../../../domain/orders/status-flow'
import type { Order, OrderStatus } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderStatusPanelProps {
  order: Order
  isMutating: boolean
  onChangeStatus: (status: OrderStatus) => void
}

function getHintKey(action: OrderStatusAction, order: Order): string {
  if (action === 'completed') {
    return order.deliveryMethod === 'pickup'
      ? 'orders.details.statusPanel.hints.completedPickup'
      : 'orders.details.statusPanel.hints.completedDelivery'
  }
  return `orders.details.statusPanel.hints.${action}`
}

const ACTION_BUTTON_CLASS_NAMES: Record<OrderStatusAction, string> = {
  processing: 'bg-accent! text-white!',
  completed: 'bg-accent! text-white!',
  ready_for_pickup: 'border! border-accent! bg-white! text-accent!',
  cancelled: 'border! border-danger! bg-white! text-danger!',
}

export function OrderStatusPanel({ order, isMutating, onChangeStatus }: OrderStatusPanelProps) {
  const { t } = useTranslation()
  const [isCancelOpen, setCancelOpen] = useState(false)
  const actions = getAvailableStatusActions(order.status, order.deliveryMethod)

  function handleAction(action: OrderStatusAction) {
    if (action === 'cancelled') {
      setCancelOpen(true)
      return
    }
    onChangeStatus(action)
  }

  function confirmCancel() {
    setCancelOpen(false)
    onChangeStatus('cancelled')
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-accent">
          {t('orders.details.statusPanel.title')}
        </h2>
        <OrderStatusBadge status={order.status} />
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-ink">{t('orders.details.statusPanel.noActions')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {actions.map((action) => (
            <div key={action} className="flex flex-col gap-1.5">
              <Button
                isDisabled={isMutating}
                onPress={() => handleAction(action)}
                className={`h-10! w-full! rounded-lg! text-sm! font-semibold! shadow-none! ${ACTION_BUTTON_CLASS_NAMES[action]}`}
              >
                {t(`orders.details.statusPanel.actions.${action}`)}
              </Button>
              <p className="text-xs text-ink">{t(getHintKey(action, order))}</p>
            </div>
          ))}
        </div>
      )}

      <Modal.Backdrop isOpen={isCancelOpen} onOpenChange={setCancelOpen}>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
            <Modal.Header>
              <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                {t('orders.details.cancelDialog.title')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="pt-4">
              <p className="text-sm text-ink">{t('orders.details.cancelDialog.message')}</p>
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onPress={() => setCancelOpen(false)}
                className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
              >
                {t('orders.details.cancelDialog.back')}
              </Button>
              <Button
                onPress={confirmCancel}
                className="h-9! rounded-md! bg-danger! px-4! text-sm! font-semibold! text-white! shadow-none!"
              >
                {t('orders.details.cancelDialog.confirm')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </section>
  )
}
