import { motion } from 'framer-motion'
import { CreateCategoryForm } from '../../features/categories/CreateCategoryForm'

export function CreateCategoryPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <CreateCategoryForm />
    </motion.div>
  )
}
