import { motion } from 'framer-motion'
import { NewProductForm } from '../../features/products/NewProductForm'

export function NewProductPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <NewProductForm />
    </motion.div>
  )
}
