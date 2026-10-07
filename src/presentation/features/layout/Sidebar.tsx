import { Avatar } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocaleStore, useTranslation, type Locale } from '../../../shared/i18n'
import { useAuthStore } from '../../stores/auth.store'

const NAV_ITEMS = [
  { to: '/', end: true, icon: 'chart', labelKey: 'nav.dashboard' },
  { to: '/products', end: false, icon: 'package', labelKey: 'nav.products' },
  { to: '/categories', end: false, icon: 'folder', labelKey: 'nav.categories' },
  { to: '/units-of-sale', end: false, icon: 'package', labelKey: 'nav.unitsOfSale' },
  // { to: '/characteristic-types', end: false, icon: 'package', labelKey: 'nav.characteristicTypes' },
  { to: '/notifications', end: false, icon: 'bell', labelKey: 'nav.notifications' },
  // { to: '/orders', end: false, icon: 'file-text-icon', labelKey: 'nav.orders' },
  { to: '/homepage', end: false, icon: 'home', labelKey: 'nav.homepage' },
  { to: '/ui-texts', end: false, icon: 'type', labelKey: 'nav.uiTexts' },
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

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col justify-between bg-accent px-6 py-10">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-[28px] font-bold text-white">{t('sidebar.brand')}</p>
          <p className="text-xs font-semibold uppercase text-field-border">
            {t('sidebar.tagline')}
          </p>
        </div>

        <nav className="flex w-full flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors ${
                  isActive
                    ? 'bg-accent-hover font-semibold text-white'
                    : 'font-medium text-field-border hover:bg-white/5'
                }`
              }
            >
              <NavIcon name={item.icon} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
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
