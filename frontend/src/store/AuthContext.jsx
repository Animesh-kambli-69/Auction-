import { createContext, useContext, useState } from 'react'

/**
 * AuthContext - Manages user authentication state
 * Stores: login status, current user data, modal visibility
 */
export const AuthContext = createContext()

/**
 * Custom hook to use AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component
 * Wraps the app to provide authentication context to all components
 */
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const login = (userData) => {
    setIsLoggedIn(true)
    setCurrentUser(userData)
    setShowLoginModal(false)
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    localStorage.removeItem('user')
  }

  const updateProfile = (updatedData) => {
    const updated = { ...currentUser, ...updatedData }
    setCurrentUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  const openLogin = () => setShowLoginModal(true)
  const closeLogin = () => setShowLoginModal(false)

  const value = {
    isLoggedIn,
    currentUser,
    login,
    logout,
    updateProfile,
    showLoginModal,
    openLogin,
    closeLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
