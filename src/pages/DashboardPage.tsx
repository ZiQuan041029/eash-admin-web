import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listAmenities,
  listRestaurants,
  listVisaUploads,
  type Restaurant,
} from '../lib/api'
import { formatDate } from '../lib/format'
import {
  cardClass,
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

type Stats = {
  listingsTotal: number
  listingsActive: number
  amenitiesTotal: number
  pendingVisas: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [restaurants, amenities, pendingVisas] = await Promise.all([
          listRestaurants(),
          listAmenities(),
          listVisaUploads('pending'),
        ])
        if (cancelled) return

        const rows = restaurants.data ?? []
        setStats({
          listingsTotal: restaurants.total ?? rows.length,
          listingsActive: rows.filter((r) => r.is_active).length,
          amenitiesTotal: amenities.length,
          pendingVisas: pendingVisas.total ?? pendingVisas.data?.length ?? 0,
        })
        setRecent(
          [...rows]
            .sort((a, b) => {
              const aTime = a.updated_at ? Date.parse(a.updated_at) : 0
              const bTime = b.updated_at ? Date.parse(b.updated_at) : 0
              return bTime - aTime
            })
            .slice(0, 5),
        )
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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className={pageSubtitle}>Overview of listings, amenities, and visa reviews.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          {today}
        </div>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total listings"
          value={stats?.listingsTotal}
          hint="Restaurants & merchants"
          loading={loading}
          tone="blue"
        />
        <StatCard
          label="Active listings"
          value={stats?.listingsActive}
          hint="Visible in the app"
          loading={loading}
          tone="emerald"
        />
        <StatCard
          label="Amenities"
          value={stats?.amenitiesTotal}
          hint="Available options"
          loading={loading}
          tone="violet"
        />
        <StatCard
          label="Pending visas"
          value={stats?.pendingVisas}
          hint="Awaiting review"
          loading={loading}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className={`lg:col-span-2 ${panelClass}`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recently updated</h2>
              <p className="text-xs text-slate-500">Latest listing changes</p>
            </div>
            <Link to="/restaurants" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>

          <div className={`${tableHeadClass} grid-cols-12`}>
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-4">Updated</div>
          </div>

          {loading ? (
            <div className={`px-4 py-6 ${mutedText}`}>Loading…</div>
          ) : recent.length === 0 ? (
            <div className={`px-4 py-6 ${mutedText}`}>No listings yet.</div>
          ) : (
            <div className={tableDivideClass}>
              {recent.map((row) => (
                <Link
                  key={row.id}
                  to={`/restaurants/${row.id}`}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-800 ${tableRowHover}`}
                >
                  <div className="col-span-5 truncate font-medium">{row.name}</div>
                  <div className="col-span-3">
                    <span className={row.is_active ? statusActive : statusHidden}>
                      {row.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="col-span-4 text-slate-500">
                    {row.updated_at ? formatDate(row.updated_at) : '—'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-xs text-slate-500">Common admin tasks</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/restaurants/new" className={`text-center ${primaryBtnSm}`}>
              + New listing
            </Link>
            <Link to="/amenities" className={secondaryAction}>
              Manage amenities
            </Link>
            <Link to="/visas" className={secondaryAction}>
              Review pending visas
            </Link>
            <Link to="/restaurants" className={secondaryAction}>
              Browse all listings
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

const secondaryAction =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-700 hover:bg-slate-50'

function StatCard({
  label,
  value,
  hint,
  loading,
  tone,
}: {
  label: string
  value?: number
  hint: string
  loading: boolean
  tone: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone]

  return (
    <div className={cardClass}>
      <div className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${toneClass}`}>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">
        {loading ? '—' : (value ?? 0)}
      </div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  )
}
