import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listVisaUploads, type VisaUploadRow } from '../lib/api'
import { formatDate } from '../lib/format'
import {
  errorBox,
  inputClass,
  mutedText,
  pageSubtitle,
  panelClass,
  tableDivideClass,
  tableHeadClass,
  tableRowHover,
} from '../lib/ui'

type Status = 'pending' | 'approved' | 'rejected'

export default function VisaListPage() {
  const [status, setStatus] = useState<Status>('pending')
  const [rows, setRows] = useState<VisaUploadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listVisaUploads(status)
        if (cancelled) return
        setRows(res.data ?? [])
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
  }, [status])

  const title = useMemo(() => {
    if (status === 'pending') return 'Pending visas'
    if (status === 'approved') return 'Approved visas'
    return 'Rejected visas'
  }, [status])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className={pageSubtitle}>
            Click a row to preview via a short-lived signed URL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      <div className={`mt-4 ${panelClass}`}>
        <div className={`${tableHeadClass} grid-cols-12`}>
          <div className="col-span-2">ID</div>
          <div className="col-span-6">R2 key</div>
          <div className="col-span-4">Created</div>
        </div>

        {loading ? (
          <div className={`px-4 py-6 ${mutedText}`}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className={`px-4 py-6 ${mutedText}`}>No rows.</div>
        ) : (
          <div className={tableDivideClass}>
            {rows.map((r) => (
              <Link
                key={r.id}
                to={`/visas/${r.id}`}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-800 ${tableRowHover}`}
              >
                <div className="col-span-2 font-medium">#{r.id}</div>
                <div className="col-span-6 truncate font-mono text-xs text-slate-500">
                  {r.r2_key}
                </div>
                <div className="col-span-4 text-slate-500">{formatDate(r.created_at)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
