export interface TranslationDictionary {
  auth: {
    login: {
      title: string
      subtitle: string
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      showPassword: string
      hidePassword: string
      rememberMe: string
      submit: string
      errors: {
        emailRequired: string
        emailInvalid: string
        passwordRequired: string
        invalidCredentials: string
        unknown: string
      }
    }
  }
  sidebar: {
    brand: string
    tagline: string
    language: string
    logout: string
    roles: {
      admin: string
      manager: string
    }
  }
  nav: {
    dashboard: string
    products: string
    categories: string
    orders: string
  }
  dashboard: {
    title: string
    greeting: string
  }
  common: {
    comingSoon: string
  }
}
