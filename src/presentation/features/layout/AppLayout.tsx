import { Toast } from '@heroui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-background print:block print:h-auto print:overflow-visible print:bg-white">
      <Sidebar />
      <main className="relative h-full min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-8 xl:px-8 2xl:px-12 2xl:pb-12 2xl:pt-10 print:h-auto print:overflow-visible print:p-0">
        <Outlet />
      </main>
      <Toast.Provider />
    </div>
  )
}
