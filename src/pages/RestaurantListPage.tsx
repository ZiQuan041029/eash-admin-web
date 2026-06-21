import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRestaurants, type Restaurant } from '../lib/api'
import { formatDate } from '../lib/format'
import {
  errorBox,
  mutedText,
  pageSubtitle,
  panelClass,
  primaryBtnSm,
  statusActive,
  statusHidden,
  tableDivideClass,
  tableHeadClass,
  tableRowHover,
} from '../lib/ui'

export default function RestaurantListPage() {
  const [rows, setRows] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listRestaurants()
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
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Restaurants & merchants</h1>
          <p className={pageSubtitle}>
            Edit listing details and amenities — changes save to the backend.
          </p>
        </div>

        <Link to="/restaurants/new" className={primaryBtnSm}>
          + New listing
        </Link>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      <div className={`mt-4 ${panelClass}`}>
        <div className={`${tableHeadClass} grid-cols-12`}>
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Subtitle</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Updated</div>
        </div>

        {loading ? (
          <div className={`px-4 py-6 ${mutedText}`}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className={`px-4 py-6 ${mutedText}`}>No listings yet.</div>
        ) : (
          <div className={tableDivideClass}>
            {rows.map((r) => (
              <Link
                key={r.id}
                to={`/restaurants/${r.id}`}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-800 ${tableRowHover}`}
              >
                <div className="col-span-4 truncate font-medium">{r.name}</div>
                <div className="col-span-3 truncate text-slate-500">
                  {r.subtitle ?? '—'}
                </div>
                <div className="col-span-2">
                  <span className={r.is_active ? statusActive : statusHidden}>
                    {r.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="col-span-3 text-slate-500">
                  {r.updated_at ? formatDate(r.updated_at) : '—'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
