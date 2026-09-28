import { motion } from 'framer-motion'
import { LoginForm } from '../../features/auth/LoginForm'
import { useTranslation } from '../../../shared/i18n'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex w-full max-w-md flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold text-accent">
            {t('auth.login.title')}
          </h1>
          <p className="text-base text-accent">{t('auth.login.subtitle')}</p>
        </div>
        <LoginForm />
      </motion.div>
    </div>
  )
}
