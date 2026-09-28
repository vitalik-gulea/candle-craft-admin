import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from './presentation/stores/auth.store'

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return <Outlet />
}

export default App
