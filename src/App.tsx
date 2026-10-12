import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { setUnauthorizedHandler } from './infrastructure/http/http-client'
import { IconSprite } from './presentation/features/layout/IconSprite'
import { useAuthStore } from './presentation/stores/auth.store'

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  return (
    <>
      <IconSprite />
      <Outlet />
    </>
  )
}

export default App
