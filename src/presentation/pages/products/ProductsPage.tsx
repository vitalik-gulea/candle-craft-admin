import { motion } from 'framer-motion'
import { useTranslation } from '../../../shared/i18n'

export function ProductsPage() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-2"
    >
      <h1 className="font-heading text-4xl font-bold text-accent">{t('nav.products')}</h1>
      <p className="text-base text-accent">{t('common.comingSoon')}</p>
    </motion.div>
  )
}
