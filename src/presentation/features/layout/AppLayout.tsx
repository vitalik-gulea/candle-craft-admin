import { Toast } from '@heroui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="h-full flex-1 overflow-y-auto px-12 pb-12 pt-10">
        <Outlet />
      </main>
      <Toast.Provider />
    </div>
  )
}
