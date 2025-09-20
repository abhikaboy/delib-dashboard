import * as React from "react"

interface AuthContextType {
  user: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

const CORRECT_PASSWORD = "iloveakmeals"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<string | null>(() => {
    // Check localStorage for existing session (only in browser)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('delibs_user')
    }
    return null
  })

  // Hydrate user state on client side
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const storedUser = localStorage.getItem('delibs_user')
      if (storedUser) {
        setUser(storedUser)
      }
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    if (password === CORRECT_PASSWORD && username.trim()) {
      setUser(username.trim())
      if (typeof window !== 'undefined') {
        localStorage.setItem('delibs_user', username.trim())
      }
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('delibs_user')
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
