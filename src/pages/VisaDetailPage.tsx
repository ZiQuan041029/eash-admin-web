import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { approveVisaUpload, rejectVisaUpload, showVisaUpload } from '../lib/api'

export default function VisaDetailPage() {
  const nav = useNavigate()
  const params = useParams()
  const id = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [adminNote, setAdminNote] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await showVisaUpload(id)
        if (cancelled) return
        setSignedUrl(res.signed_url)
        setStatus(res.status)
        setAdminNote(res.admin_note ?? '')
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message ?? String(e))
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/visas" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">Visa #{id}</h1>
          {status ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {status}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 text-sm text-white/70">Loading…</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {signedUrl ? (
              <img
                src={signedUrl}
                className="block w-full"
                alt="Visa preview"
              />
            ) : (
              <div className="p-6 text-sm text-white/70">No signed URL.</div>
            )}
            <div className="border-t border-white/10 p-3 text-xs text-white/60">
              Signed URL expires soon — refresh page if it breaks.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Decision</div>
            <div className="mt-2">
              <div className="text-xs text-white/60">Admin note (optional)</div>
              <textarea
                className="mt-1 h-28 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-white/20"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                disabled={saving}
                className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-60"
                onClick={async () => {
                  setSaving(true)
                  try {
                    await approveVisaUpload(id, adminNote)
                    nav('/visas')
                  } catch (e: any) {
                    setError(e?.message ?? String(e))
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Approve
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-red-400 px-3 py-2 text-sm font-semibold text-black hover:bg-red-300 disabled:opacity-60"
                onClick={async () => {
                  setSaving(true)
                  try {
                    await rejectVisaUpload(id, adminNote)
                    nav('/visas')
                  } catch (e: any) {
                    setError(e?.message ?? String(e))
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

