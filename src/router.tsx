import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import { AppLayout } from './presentation/features/layout/AppLayout'
import { GuestOnly } from './presentation/guards/GuestOnly'
import { RequireAuth } from './presentation/guards/RequireAuth'
import { LoginPage } from './presentation/pages/auth/LoginPage'
import { CategoriesPage } from './presentation/pages/categories/CategoriesPage'
import { DashboardPage } from './presentation/pages/dashboard/DashboardPage'
import { OrdersPage } from './presentation/pages/orders/OrdersPage'
import { ProductsPage } from './presentation/pages/products/ProductsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'orders', element: <OrdersPage /> },
            ],
          },
        ],
      },
      {
        element: <GuestOnly />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
