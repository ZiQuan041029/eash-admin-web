import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { approveVisaUpload, rejectVisaUpload, showVisaUpload } from '../lib/api'
import {
  cardClass,
  errorBox,
  inputClass,
  linkBack,
  mutedText,
  panelClass,
  statusBadge,
} from '../lib/ui'

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
          <Link to="/visas" className={linkBack}>
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Visa #{id}</h1>
          {status ? <span className={statusBadge}>{status}</span> : null}
        </div>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      {loading ? (
        <div className={`mt-4 ${mutedText}`}>Loading…</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={panelClass}>
            {signedUrl ? (
              <img src={signedUrl} className="block w-full" alt="Visa preview" />
            ) : (
              <div className={`p-6 ${mutedText}`}>No signed URL.</div>
            )}
            <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
              Signed URL expires soon — refresh page if it breaks.
            </div>
          </div>

          <div className={cardClass}>
            <div className="text-sm font-semibold text-slate-900">Decision</div>
            <div className="mt-2">
              <div className="text-xs text-slate-500">Admin note (optional)</div>
              <textarea
                className={`${inputClass} mt-1 h-28 resize-none`}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
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
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
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
