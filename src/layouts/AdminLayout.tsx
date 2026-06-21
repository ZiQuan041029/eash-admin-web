import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { setToken } from '../lib/api'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
    isActive
      ? 'bg-blue-50 font-medium text-blue-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400">
      {children}
    </span>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full bg-slate-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-5">
          <div className="text-sm font-semibold tracking-wide text-slate-900">
            EASH Admin
          </div>
          <div className="mt-1 text-xs text-slate-500">Content management</div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Manage
          </div>

          <NavLink to="/dashboard" className={navLinkClass}>
            <NavIcon>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h3v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4h3a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7Z" />
              </svg>
            </NavIcon>
            Dashboard
          </NavLink>

          <NavLink to="/restaurants" className={navLinkClass}>
            <NavIcon>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm0 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z" />
              </svg>
            </NavIcon>
            Listings
          </NavLink>

          <NavLink to="/amenities" className={navLinkClass}>
            <NavIcon>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 0 1 .894.553l1.618 3.276 3.618.526a1 1 0 0 1 .554 1.706l-2.618 2.553.618 3.604a1 1 0 0 1-1.451 1.054L10 13.347l-3.235 1.702a1 1 0 0 1-1.451-1.054l.618-3.604L3.314 8.061a1 1 0 0 1 .554-1.706l3.618-.526L9.106 2.553A1 1 0 0 1 10 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </NavIcon>
            Amenities
          </NavLink>

          <NavLink to="/visas" className={navLinkClass}>
            <NavIcon>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z"
                  clipRule="evenodd"
                />
              </svg>
            </NavIcon>
            Visas
          </NavLink>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              setToken('')
              navigate('/login', { replace: true })
            }}
          >
            <NavIcon>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm6.22 3.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.72-1.72H6.75a.75.75 0 0 1 0-1.5h4.19l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </NavIcon>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
