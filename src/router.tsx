import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import { AppLayout } from './presentation/features/layout/AppLayout'
import { GuestOnly } from './presentation/guards/GuestOnly'
import { RequireAuth } from './presentation/guards/RequireAuth'
import { LoginPage } from './presentation/pages/auth/LoginPage'
import { CreateCategoryPage } from './presentation/pages/categories/CreateCategoryPage'
import { EditCategoryPage } from './presentation/pages/categories/EditCategoryPage'
import { CategoriesPage } from './presentation/pages/categories/CategoriesPage'
import { NavigationPage } from './presentation/pages/navigation/NavigationPage'
import { HomepagePage } from './presentation/pages/homepage/HomepagePage'
import { NotificationsPage } from './presentation/pages/notifications/NotificationsPage'
import { OrderDetailsPage } from './presentation/pages/orders/OrderDetailsPage'
import { OrdersPage } from './presentation/pages/orders/OrdersPage'
import { SettingsPage } from './presentation/pages/settings/SettingsPage'
import { RequireRole } from './presentation/guards/RequireRole'
import { AcceptInvitePage } from './presentation/pages/auth/AcceptInvitePage'
import { UsersPage } from './presentation/pages/users/UsersPage'
import { TelegramPage } from './presentation/pages/telegram/TelegramPage'
import { TrashPage } from './presentation/pages/trash/TrashPage'
import { UiTextsPage } from './presentation/pages/ui-texts/UiTextsPage'
import { EditProductPage } from './presentation/pages/products/EditProductPage'
import { NewProductPage } from './presentation/pages/products/NewProductPage'
import { ProductsPage } from './presentation/pages/products/ProductsPage'
import { UnitsOfSalePage } from './presentation/pages/units-of-sale/UnitsOfSalePage'
// import { CharacteristicTypesPage } from './presentation/pages/characteristic-types/CharacteristicTypesPage'

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
              { index: true, element: <Navigate to="/products" replace /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'products/new', element: <NewProductPage /> },
              { path: 'products/:productId', element: <EditProductPage /> },
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'categories/new', element: <CreateCategoryPage /> },
              { path: 'categories/:id/edit', element: <EditCategoryPage /> },
              { path: 'units-of-sale', element: <UnitsOfSalePage /> },
              // { path: 'characteristic-types', element: <CharacteristicTypesPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:orderId', element: <OrderDetailsPage /> },
              { path: 'homepage', element: <HomepagePage /> },
              { path: 'navigation', element: <NavigationPage /> },
              { path: 'ui-texts', element: <UiTextsPage /> },
              {
                element: <RequireRole role="admin" />,
                children: [
                  { path: 'telegram', element: <TelegramPage /> },
                  { path: 'users', element: <UsersPage /> },
                ],
              },
              { path: 'trash', element: <TrashPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
      {
        element: <GuestOnly />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },
      { path: 'accept-invite', element: <AcceptInvitePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
