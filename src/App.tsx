import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { isLoggedIn } from './lib/api'
import AdminLayout from './layouts/AdminLayout'
import AmenityListPage from './pages/AmenityListPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RestaurantEditPage from './pages/RestaurantEditPage'
import RestaurantListPage from './pages/RestaurantListPage'
import VisaListPage from './pages/VisaListPage'
import VisaDetailPage from './pages/VisaDetailPage'

function Protected({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function HomeRedirect() {
  return <Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantEditPage />} />
        <Route path="/amenities" element={<AmenityListPage />} />
        <Route path="/visas" element={<VisaListPage />} />
        <Route path="/visas/:id" element={<VisaDetailPage />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
