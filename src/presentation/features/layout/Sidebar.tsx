import { Avatar, Chip } from '@heroui/react'
import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocaleStore, useTranslation, type Locale } from '../../../shared/i18n'
import { useAuthStore } from '../../stores/auth.store'
import { useOrdersStore } from '../../stores/orders.store'
import { useTelegramStore } from '../../stores/telegram.store'

const NAV_ITEMS = [
  { to: '/', end: true, icon: 'chart', labelKey: 'nav.dashboard' },
  { to: '/products', end: false, icon: 'package', labelKey: 'nav.products' },
  { to: '/categories', end: false, icon: 'folder', labelKey: 'nav.categories' },
  { to: '/units-of-sale', end: false, icon: 'package', labelKey: 'nav.unitsOfSale' },
  // { to: '/characteristic-types', end: false, icon: 'package', labelKey: 'nav.characteristicTypes' },
  { to: '/notifications', end: false, icon: 'bell', labelKey: 'nav.notifications' },
  { to: '/orders', end: false, icon: 'file-text', labelKey: 'nav.orders' },
  { to: '/homepage', end: false, icon: 'home', labelKey: 'nav.homepage' },
  { to: '/ui-texts', end: false, icon: 'type', labelKey: 'nav.uiTexts' },
  { to: '/users', end: false, icon: 'users', labelKey: 'nav.users' },
  { to: '/telegram', end: false, icon: 'send', labelKey: 'nav.telegram' },
  { to: '/trash', end: false, icon: 'trash', labelKey: 'nav.trash' },
  // { to: '/settings', end: false, icon: 'settings-icon', labelKey: 'nav.settings' },
] as const

function NavIcon({ name }: { name: (typeof NAV_ITEMS)[number]['icon'] }) {
  const props = {
    className: 'size-[18px] shrink-0',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  if (name === 'chart') {
    return (
      <svg viewBox="0 0 18 18" {...props}>
        <path d="M2.25 2.25v12c0 .4.16.78.44 1.06.28.28.66.44 1.06.44h12M13.5 12.75V6.75M9.75 12.75V3.75M6 12.75V10.5" />
      </svg>
    )
  }

  if (name === 'package') {
    return (
      <svg viewBox="0 0 18 18" {...props}>
        <path d="M9 16.5V9m0 0L2.47 5.25M9 9l6.53-3.75M5.63 3.2l6.75 3.86M8.25 16.3A1.5 1.5 0 0 0 9 16.5c.26 0 .52-.07.75-.2l5.25-3a1.5 1.5 0 0 0 .75-1.3V6a1.5 1.5 0 0 0-.75-1.3l-5.25-3A1.5 1.5 0 0 0 9 1.5a1.5 1.5 0 0 0-.75.2l-5.25 3A1.5 1.5 0 0 0 2.25 6v6c0 .26.07.52.2.75.13.23.32.42.55.55l5.25 3Z" />
      </svg>
    )
  }

  if (name === 'folder') {
    return (
      <svg viewBox="0 0 18 18" {...props}>
        <path d="M16.06 14.56c-.28.28-.66.44-1.06.44H3c-.4 0-.78-.16-1.06-.44A1.5 1.5 0 0 1 1.5 13.5V3.75c0-.4.16-.78.44-1.06.28-.28.66-.44 1.06-.44h2.95c.25 0 .49.06.71.18.22.12.4.29.54.5l.61.9c.14.21.32.38.55.5.22.12.47.18.72.17h5.92c.4 0 .78.16 1.06.44.28.28.44.66.44 1.06V13.5c0 .4-.16.78-.44 1.06Z" />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    )
  }

  if (name === 'file-text') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  if (name === 'send') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
      </svg>
    )
  }

  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="m3 10 9-8 9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />
      </svg>
    )
  }

  if (name === 'type') {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

const LANGUAGES: Locale[] = ['ro', 'ru']

const NEW_ORDERS_REFRESH_MS = 60_000

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Sidebar() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const newOrdersCount = useOrdersStore((state) => state.newCount)
  const loadNewOrdersCount = useOrdersStore((state) => state.loadNewCount)

  const isAdmin = user?.role === 'admin'
  const pendingTelegramCount = useTelegramStore((state) => state.pendingCount)
  const loadPendingTelegramCount = useTelegramStore((state) => state.loadPendingCount)

  useEffect(() => {
    if (!isAdmin) return
    void loadPendingTelegramCount()
    const timer = window.setInterval(() => void loadPendingTelegramCount(), NEW_ORDERS_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [isAdmin, loadPendingTelegramCount])

  const navItems = NAV_ITEMS.filter((item) => (item.to !== '/telegram' && item.to !== '/users') || isAdmin)

  useEffect(() => {
    void loadNewOrdersCount()
    const timer = window.setInterval(() => void loadNewOrdersCount(), NEW_ORDERS_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [loadNewOrdersCount])

  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col overflow-hidden bg-accent px-6 py-4 print:hidden [@media(min-height:800px)]:py-6 [@media(min-height:960px)]:py-10">
      <div className="flex shrink-0 flex-col gap-1">
        <p className="font-heading text-2xl font-bold text-white [@media(min-height:800px)]:text-[28px]">
          {t('sidebar.brand')}
        </p>
        <p className="text-xs font-semibold uppercase text-field-border">{t('sidebar.tagline')}</p>
      </div>

      <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain [@media(min-height:800px)]:mt-6 [@media(min-height:800px)]:gap-1.5 [@media(min-height:960px)]:mt-10 [@media(min-height:960px)]:gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-[15px] transition-colors [@media(min-height:800px)]:py-2.5 [@media(min-height:960px)]:py-3 ${
                isActive
                  ? 'bg-accent-hover font-semibold text-white'
                  : 'font-medium text-field-border hover:bg-white/5'
              }`
            }
          >
            <NavIcon name={item.icon} />
            <span className="flex-1">{t(item.labelKey)}</span>
            {item.to === '/orders' && newOrdersCount > 0 ? (
              <Chip
                size="sm"
                aria-label={t('orders.newOrdersBadge', { count: String(newOrdersCount) })}
                className="bg-warning! text-ink!"
              >
                {newOrdersCount}
              </Chip>
            ) : null}
            {item.to === '/telegram' && pendingTelegramCount > 0 ? (
              <Chip
                size="sm"
                aria-label={t('telegram.newRequestsBadge', {
                  count: String(pendingTelegramCount),
                })}
                className="bg-warning! text-ink!"
              >
                {pendingTelegramCount}
              </Chip>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 flex shrink-0 flex-col gap-3 border-t border-white/10 pt-4 [@media(min-height:800px)]:mt-6 [@media(min-height:800px)]:gap-4 [@media(min-height:800px)]:pt-5 [@media(min-height:960px)]:gap-5">
        <div className="flex items-center gap-3">
          <Avatar>
            <Avatar.Fallback>{user ? getInitials(user.fullName) : ''}</Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-field-border">
              {user ? t(`sidebar.roles.${user.role}`) : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2">
          <p className="text-[13px] font-medium text-field-border">{t('sidebar.language')}</p>
          <div className="flex items-center gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLocale(lang)}
                className={`rounded-full px-2.5 py-1 text-[13px] font-semibold transition-colors ${
                  locale === lang
                    ? 'bg-accent-hover text-white'
                    : 'text-field-border hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="flex items-center gap-2 py-1 text-sm font-medium text-field-border transition-colors hover:text-white"
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10.667 4.667 14 8l-3.333 3.333M14 8H6M6 14H3.333A1.333 1.333 0 0 1 2 12.667V3.333A1.333 1.333 0 0 1 3.333 2H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  )
}
