import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { isLoggedIn, setToken } from './lib/api'
import LoginPage from './pages/LoginPage'
import VisaListPage from './pages/VisaListPage'
import VisaDetailPage from './pages/VisaDetailPage'

function Protected({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function HomeRedirect() {
  return <Navigate to={isLoggedIn() ? '/visas' : '/login'} replace />
}

function AppHeader() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()

  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold tracking-wide">EASH Admin</div>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <button
              type="button"
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              onClick={() => {
                setToken('')
                navigate('/login', { replace: true })
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-full">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/visas"
            element={
              <Protected>
                <VisaListPage />
              </Protected>
            }
          />
          <Route
            path="/visas/:id"
            element={
              <Protected>
                <VisaDetailPage />
              </Protected>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </main>
    </div>
  )
}

