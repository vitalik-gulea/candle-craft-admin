import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { NewProductForm } from '../../features/products/NewProductForm'

export function EditProductPage() {
  const { productId } = useParams()

  if (!productId) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <NewProductForm productId={productId} />
    </motion.div>
  )
}
