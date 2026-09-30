import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { IconSprite } from './presentation/features/layout/IconSprite'
import { useAuthStore } from './presentation/stores/auth.store'

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <>
      <IconSprite />
      <Outlet />
    </>
  )
}

export default App
