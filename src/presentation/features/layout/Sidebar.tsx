import { Avatar } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocaleStore, useTranslation, type Locale } from '../../../shared/i18n'
import { useAuthStore } from '../../stores/auth.store'

const NAV_ITEMS = [
  { to: '/', end: true, icon: 'chart-column-icon', labelKey: 'nav.dashboard' },
  { to: '/products', end: false, icon: 'package-icon', labelKey: 'nav.products' },
  { to: '/categories', end: false, icon: 'folder-icon', labelKey: 'nav.categories' },
  { to: '/units-of-sale', end: false, icon: 'package-icon', labelKey: 'nav.unitsOfSale' },
  { to: '/orders', end: false, icon: 'file-text-icon', labelKey: 'nav.orders' },
  { to: '/homepage', end: false, icon: 'home-icon', labelKey: 'nav.homepage' },
  { to: '/trash', end: false, icon: 'trash-icon', labelKey: 'nav.trash' },
  { to: '/settings', end: false, icon: 'settings-icon', labelKey: 'nav.settings' },
] as const

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
              <svg className="size-[18px] shrink-0" aria-hidden="true">
                <use href={`/icons.svg#${item.icon}`} />
              </svg>
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
          <svg className="size-4" aria-hidden="true">
            <use href="/icons.svg#log-out-icon" />
          </svg>
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  )
}
