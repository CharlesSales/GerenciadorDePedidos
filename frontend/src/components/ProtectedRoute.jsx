// components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      if (adminOnly && !isAdmin) {
        router.push('/')
        return
      }
    }
  }, [user, loading, isAuthenticated, isAdmin, adminOnly, router])

  if (loading) {
    return <div>⏳ Carregando...</div>
  }

  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null
  }

  return children
}