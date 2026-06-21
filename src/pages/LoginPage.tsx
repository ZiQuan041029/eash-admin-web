import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, login, setToken } from '../lib/api'
import {
  cardClass,
  codeClass,
  errorBox,
  inputClass,
  primaryBtnSm,
  secondaryBtnSm,
  warnBox,
} from '../lib/ui'

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSavedSession = isLoggedIn()

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 py-10">
      <div className={`mx-auto w-full max-w-md ${cardClass}`}>
        <h1 className="text-xl font-semibold text-slate-900">Admin login</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use an account with <code className={codeClass}>is_admin=1</code>.
        </p>

        {hasSavedSession ? (
          <div className={`mt-4 ${warnBox}`}>
            <p>You have a saved session in this browser (maybe from production).</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/dashboard" className={primaryBtnSm}>
                Continue to dashboard
              </Link>
              <button
                type="button"
                className={secondaryBtnSm}
                onClick={() => {
                  setToken('')
                  window.location.reload()
                }}
              >
                Clear session & sign in again
              </button>
            </div>
          </div>
        ) : null}

        {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await login(email.trim(), password)
              nav('/dashboard')
            } catch (e: any) {
              setError(e?.message ?? String(e))
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="block">
            <div className="text-sm text-slate-600">Email</div>
            <input
              className={`${inputClass} mt-1`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block">
            <div className="text-sm text-slate-600">Password</div>
            <input
              type="password"
              className={`${inputClass} mt-1`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button disabled={loading} className={`w-full ${primaryBtnSm}`}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
