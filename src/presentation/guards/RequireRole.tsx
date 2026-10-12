import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../../domain/auth/types'
import { useAuthStore } from '../stores/auth.store'

export function RequireRole({ role }: { role: UserRole }) {
  const user = useAuthStore((state) => state.user)

  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
