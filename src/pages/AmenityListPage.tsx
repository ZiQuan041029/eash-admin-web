import { useEffect, useState } from 'react'
import {
  createAmenity,
  deleteAmenity,
  listAmenities,
  updateAmenity,
  type Amenity,
  type AmenityPayload,
} from '../lib/api'
import {
  cardClass,
  dangerBtnSm,
  errorBox,
  inputClass,
  labelClass,
  mutedText,
  pageSubtitle,
  panelClass,
  primaryBtn,
  secondaryBtn,
  statusActive,
  statusHidden,
  tableDivideClass,
  tableHeadClass,
  secondaryBtnSm,
} from '../lib/ui'

const ICON_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'sim_card', label: 'SIM card' },
  { value: 'print', label: 'Print' },
  { value: 'dashboard', label: 'Dashboard / board' },
  { value: 'package', label: 'Parcel / package' },
  { value: 'local_parking', label: 'Parking' },
  { value: 'accessible', label: 'Accessible' },
  { value: 'restaurant', label: 'Food / restaurant' },
  { value: 'ac_unit', label: 'Air conditioning' },
] as const

type FormState = {
  name: string
  icon: string
  sortOrder: string
  isActive: boolean
}

const emptyForm = (): FormState => ({
  name: '',
  icon: 'wifi',
  sortOrder: '0',
  isActive: true,
})

export default function AmenityListPage() {
  const [rows, setRows] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  async function loadRows() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAmenities()
      setRows(data)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [])

  function startEdit(row: Amenity) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      icon: row.icon,
      sortOrder: String(row.sort_order),
      isActive: row.is_active,
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  function buildPayload(): AmenityPayload {
    return {
      name: form.name.trim(),
      icon: form.icon,
      is_active: form.isActive,
      sort_order: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (editingId == null) {
        await createAmenity(payload)
      } else {
        await updateAmenity(editingId, payload)
      }
      cancelEdit()
      await loadRows()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row: Amenity) {
    if (!window.confirm(`Delete "${row.name}"? It will be removed from all listings.`)) {
      return
    }

    setSaving(true)
    setError(null)
    try {
      await deleteAmenity(row.id)
      if (editingId === row.id) {
        cancelEdit()
      }
      await loadRows()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(row: Amenity) {
    setSaving(true)
    setError(null)
    try {
      await updateAmenity(row.id, { is_active: !row.is_active })
      await loadRows()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Amenities</h1>
        <p className={pageSubtitle}>
          Manage amenity options shown on merchant listings. New amenities appear as
          checkboxes when editing a listing.
        </p>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      <section className={`mt-4 ${cardClass}`}>
        <h2 className="text-sm font-semibold text-slate-900">
          {editingId == null ? 'Add amenity' : `Edit amenity #${editingId}`}
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={labelClass}>Name *</span>
            <input
              className={`${inputClass} mt-1`}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Free WI-FI"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Icon</span>
            <select
              className={`${inputClass} mt-1`}
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Sort order</span>
            <input
              className={`${inputClass} mt-1`}
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">Active (shown in listing edit form)</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={saving} className={primaryBtn} onClick={handleSave}>
            {saving ? 'Saving…' : editingId == null ? 'Add amenity' : 'Save changes'}
          </button>
          {editingId != null ? (
            <button type="button" disabled={saving} className={secondaryBtn} onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <div className={`mt-4 ${panelClass}`}>
        <div className={`${tableHeadClass} grid-cols-12`}>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Icon</div>
          <div className="col-span-2">Sort</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {loading ? (
          <div className={`px-4 py-6 ${mutedText}`}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className={`px-4 py-6 ${mutedText}`}>No amenities yet.</div>
        ) : (
          <div className={tableDivideClass}>
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm text-slate-800"
              >
                <div className="col-span-3 truncate font-medium">{row.name}</div>
                <div className="col-span-2 truncate font-mono text-xs text-slate-400">
                  {row.icon}
                </div>
                <div className="col-span-2 text-slate-500">{row.sort_order}</div>
                <div className="col-span-2">
                  <button
                    type="button"
                    disabled={saving}
                    className={row.is_active ? statusActive : statusHidden}
                    onClick={() => toggleActive(row)}
                  >
                    {row.is_active ? 'Active' : 'Hidden'}
                  </button>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    className={secondaryBtnSm}
                    onClick={() => startEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    className={dangerBtnSm}
                    onClick={() => handleDelete(row)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
