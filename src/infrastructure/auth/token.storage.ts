import type { TokenPersistence, TokenStorage } from '../../application/auth/ports'

const TOKEN_KEY = 'cc_access_token'
const PERSISTENCE_KEY = 'cc_token_persistence'

function read(persistence: TokenPersistence): Storage {
  return persistence === 'local' ? localStorage : sessionStorage
}

export const tokenStorage: TokenStorage = {
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  },

  getPersistence() {
    const value = localStorage.getItem(PERSISTENCE_KEY) ?? sessionStorage.getItem(PERSISTENCE_KEY)
    if (value === 'local' || value === 'session') return value
    return null
  },

  setAccessToken(token, persistence) {
    this.clear()
    read(persistence).setItem(TOKEN_KEY, token)
    read(persistence).setItem(PERSISTENCE_KEY, persistence)
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PERSISTENCE_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(PERSISTENCE_KEY)
  },
}
