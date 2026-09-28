import type { TranslationDictionary } from './types'

export const ro: TranslationDictionary = {
  auth: {
    login: {
      title: 'Bine ați venit',
      subtitle: 'Conectați-vă la contul dvs.',
      emailLabel: 'Email',
      emailPlaceholder: 'Emailul dvs.',
      passwordLabel: 'Parolă',
      passwordPlaceholder: 'Parola dvs.',
      showPassword: 'Afișează',
      hidePassword: 'Ascunde',
      rememberMe: 'Ține-mă minte',
      submit: 'Conectare',
      errors: {
        emailRequired: 'Introduceți emailul',
        emailInvalid: 'Introduceți un email valid',
        passwordRequired: 'Introduceți parola',
        invalidCredentials: 'Email sau parolă invalidă',
        unknown: 'Autentificarea a eșuat. Încercați din nou',
      },
    },
  },
  sidebar: {
    brand: 'Candle Craft',
    tagline: 'Panou de administrare',
    language: 'Limbă',
    logout: 'Ieșire din sistem',
    roles: {
      admin: 'Administrator',
      manager: 'Manager',
    },
  },
  nav: {
    dashboard: 'Tablou de bord',
    products: 'Produse',
    categories: 'Categorii',
    orders: 'Comenzi',
  },
  dashboard: {
    title: 'Tablou de bord',
    greeting: 'Sunteți conectat ca {name}',
  },
  common: {
    comingSoon: 'Secțiunea este în curs de dezvoltare',
  },
}
