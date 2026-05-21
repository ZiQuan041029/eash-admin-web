import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, login, setToken } from '../lib/api'

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSavedSession = isLoggedIn()

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Admin login</h1>
        <p className="mt-1 text-sm text-white/70">
          Use an account with <code className="rounded bg-white/10 px-1">is_admin=1</code>.
        </p>

        {hasSavedSession ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <p>You have a saved session in this browser (maybe from production).</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                to="/visas"
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Continue to visas
              </Link>
              <button
                type="button"
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
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

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await login(email.trim(), password)
              nav('/visas')
            } catch (e: any) {
              setError(e?.message ?? String(e))
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="block">
            <div className="text-sm text-white/70">Email</div>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none ring-0 focus:border-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block">
            <div className="text-sm text-white/70">Password</div>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none ring-0 focus:border-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
