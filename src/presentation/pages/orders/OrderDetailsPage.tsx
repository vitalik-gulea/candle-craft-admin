import { Alert, Button, Spinner, toast } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { OrderStatus, UpdateOrderInput } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import { OrderEditForm } from '../../features/orders/OrderEditForm'
import { OrderHistoryTimeline } from '../../features/orders/OrderHistoryTimeline'
import {
  OrderCustomerCommentCard,
  OrderCompanyCard,
  OrderPaymentCard,
  OrderSourceCard,
} from '../../features/orders/OrderInfoCards'
import { OrderItemsCard } from '../../features/orders/OrderItemsCard'
import { OrderPrintView } from '../../features/orders/OrderPrintView'
import { OrderStatusPanel } from '../../features/orders/OrderStatusPanel'
import { useOrderDetailStore } from '../../stores/order-detail.store'
import { useOrdersStore } from '../../stores/orders.store'

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'FORBIDDEN') return t('orders.errors.forbidden')
  if (code === 'NOT_FOUND') return t('orders.errors.notFound')
  if (code === 'VALIDATION') return t('orders.errors.validation')
  if (code === 'CONFLICT') return t('orders.errors.conflict')
  return t('orders.errors.unknown')
}

export function OrderDetailsPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const order = useOrderDetailStore((state) => state.order)
  const history = useOrderDetailStore((state) => state.history)
  const isLoading = useOrderDetailStore((state) => state.isLoading)
  const isMutating = useOrderDetailStore((state) => state.isMutating)
  const errorCode = useOrderDetailStore((state) => state.errorCode)
  const errorDetails = useOrderDetailStore((state) => state.errorDetails)
  const load = useOrderDetailStore((state) => state.load)
  const reset = useOrderDetailStore((state) => state.reset)
  const changeStatus = useOrderDetailStore((state) => state.changeStatus)
  const update = useOrderDetailStore((state) => state.update)
  const loadNewCount = useOrdersStore((state) => state.loadNewCount)

  useEffect(() => {
    if (!orderId) return
    void load(orderId)
    return reset
  }, [orderId, load, reset])

  async function handleChangeStatus(status: OrderStatus) {
    const result = await changeStatus(status)
    if (result === 'ok') toast.success(t('orders.details.toasts.statusChanged'))
    if (result === 'conflict') toast.warning(t('orders.details.toasts.statusConflict'))
    if (result !== 'error') void loadNewCount()
  }

  async function handleUpdate(changes: UpdateOrderInput): Promise<boolean> {
    const saved = await update(changes)
    if (saved) toast.success(t('orders.details.toasts.saved'))
    return saved
  }

  const errorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails
  const isBlockingError = !order && !isLoading && errorMessage !== null
  const formError =
    order && errorMessage
      ? errorCode === 'VALIDATION' && detailsText
        ? `${errorMessage}: ${detailsText}`
        : errorMessage
      : null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex w-full flex-col gap-8 print:hidden"
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="w-fit text-sm font-semibold text-accent hover:underline"
            >
              ← {t('orders.details.back')}
            </button>
            {order ? (
              <>
                <h1 className="font-heading text-[32px] font-bold text-accent">
                  {t('orders.details.title', { number: order.displayNumber })}
                </h1>
                <p className="text-sm text-ink">
                  {t('orders.details.createdAt')}: {formatChisinauDateTime(order.createdAt, locale)}
                </p>
              </>
            ) : null}
          </div>
          {order ? (
            <Button
              variant="outline"
              onPress={() => window.print()}
              className="h-10! rounded-lg! border-accent! bg-white! px-5! text-sm! font-semibold! text-accent! shadow-none!"
            >
              {t('orders.details.print')}
            </Button>
          ) : null}
        </div>

        {isBlockingError ? (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Title>{errorMessage}</Alert.Title>
              {errorCode === 'VALIDATION' && detailsText ? (
                <Alert.Description>{detailsText}</Alert.Description>
              ) : null}
            </Alert.Content>
          </Alert>
        ) : null}

        {isLoading && !order ? (
          <div className="flex min-h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : null}

        {order ? (
          <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-6">
              <OrderItemsCard order={order} locale={locale} />
              <OrderEditForm
                order={order}
                isMutating={isMutating}
                serverError={formError}
                onSubmit={handleUpdate}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              <OrderStatusPanel
                order={order}
                isMutating={isMutating}
                onChangeStatus={(status) => void handleChangeStatus(status)}
              />
              <OrderCompanyCard order={order} />
              <OrderPaymentCard order={order} />
              <OrderSourceCard order={order} />
              <OrderCustomerCommentCard order={order} />
              <OrderHistoryTimeline entries={history} locale={locale} />
            </div>
          </div>
        ) : null}
      </motion.div>

      {order ? <OrderPrintView order={order} locale={locale} /> : null}
    </>
  )
}
