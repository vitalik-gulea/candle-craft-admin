import { motion } from 'framer-motion'
import { useTranslation } from '../../../shared/i18n'
import { InviteUserForm } from '../../features/users/InviteUserForm'

export function UsersPage() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-bold text-accent">{t('users.title')}</h1>
        <p className="text-sm text-muted">{t('users.subtitle')}</p>
      </div>
      <InviteUserForm />
    </motion.div>
  )
}
