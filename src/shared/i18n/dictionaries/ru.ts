import type { TranslationDictionary } from './types'

export const ru: TranslationDictionary = {
  auth: {
    login: {
      title: 'Добро пожаловать',
      subtitle: 'Войдите в свой аккаунт',
      emailLabel: 'Email',
      emailPlaceholder: 'Ваш email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Ваш пароль',
      showPassword: 'Показать',
      hidePassword: 'Скрыть',
      rememberMe: 'Запомнить меня',
      submit: 'Войти',
      errors: {
        emailRequired: 'Введите email',
        emailInvalid: 'Введите корректный email',
        passwordRequired: 'Введите пароль',
        invalidCredentials: 'Неверный email или пароль',
        unknown: 'Не удалось войти. Попробуйте ещё раз',
      },
    },
  },
  sidebar: {
    brand: 'Candle Craft',
    tagline: 'Админ-панель',
    language: 'Язык',
    logout: 'Выйти из системы',
    roles: {
      admin: 'Администратор',
      manager: 'Менеджер',
    },
  },
  nav: {
    dashboard: 'Дашборд',
    products: 'Товары',
    categories: 'Категории',
    orders: 'Заказы',
  },
  dashboard: {
    title: 'Дашборд',
    greeting: 'Вы вошли как {name}',
  },
  common: {
    comingSoon: 'Раздел находится в разработке',
  },
}
