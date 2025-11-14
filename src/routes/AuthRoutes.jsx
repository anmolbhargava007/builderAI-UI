import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loadable from '@/ui-component/loading/Loadable'

const Login = Loadable(lazy(() => import('@/views/auth/Login')))
const Signup = Loadable(lazy(() => import('@/views/auth/Signup')))

const AuthGuard = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    
    if (loading) return null
    
    if (isAuthenticated) {
        return <Navigate to="/chatflows" replace />
    }
    
    return children
}

const AuthRoutes = {
    path: '/',
    children: [
      {
        index: true,
        element: <Navigate to="/chatflows" replace />
      },
      {
        path: 'login',
        element: (
          <AuthGuard>
            <Login />
          </AuthGuard>
        )
      },
      {
        path: 'signup',
        element: (
          <AuthGuard>
            <Signup />
          </AuthGuard>
        )
      }
    ]
  }
  

export default AuthRoutes