import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../shared/i18n'

interface OrdersTabsProps {
  active: 'orders' | 'archive'
}

export function OrdersTabs({ active }: OrdersTabsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const tabs = [
    { key: 'orders', path: '/orders', label: t('orders.archive.tabs.orders') },
    { key: 'archive', path: '/orders/archive', label: t('orders.archive.tabs.archive') },
  ] as const

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={tab.key === active ? 'primary' : 'outline'}
          onPress={() => navigate(tab.path)}
          className={`h-9! rounded-md! px-4! text-sm! font-semibold! shadow-none! ${
            tab.key === active
              ? 'bg-accent! text-white!'
              : 'border-field-border! bg-white! text-accent!'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
