import { Toast } from '@heroui/react'
import { Outlet } from 'react-router-dom'
import { MobileHeader, Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-background lg:flex-row print:block print:h-auto print:overflow-visible print:bg-white">
      <MobileHeader />
      <Sidebar />
      <main className="relative h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:pb-8 lg:pt-8 xl:px-8 2xl:px-12 2xl:pb-12 2xl:pt-10 print:h-auto print:overflow-visible print:p-0">
        <Outlet />
      </main>
      <Toast.Provider />
    </div>
  )
}
