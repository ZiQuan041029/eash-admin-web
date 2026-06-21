import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createRestaurant,
  deleteRestaurant,
  listAmenities,
  showRestaurant,
  updateRestaurant,
  type Amenity,
  type RestaurantPayload,
} from '../lib/api'
import {
  cardClass,
  checkboxRow,
  dangerBtn,
  errorBox,
  inputClass,
  labelClass,
  linkBack,
  mutedText,
  primaryBtn,
  secondaryBtnSm,
} from '../lib/ui'

type ImageRow = { url: string }

export default function RestaurantEditPage() {
  const nav = useNavigate()
  const params = useParams()
  const rawId = params.id ?? ''
  const isNew = rawId === 'new'
  const id = isNew ? null : Number(rawId)
  const invalidId = !isNew && Number.isNaN(id)

  const [loading, setLoading] = useState(!isNew && !invalidId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amenities, setAmenities] = useState<Amenity[]>([])

  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [rating, setRating] = useState('')
  const [qrData, setQrData] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [hoursText, setHoursText] = useState('')
  const [amenityIds, setAmenityIds] = useState<number[]>([])
  const [images, setImages] = useState<ImageRow[]>([{ url: '' }])

  const title = useMemo(() => {
    if (isNew) return 'New listing'
    if (invalidId) return 'Invalid listing'
    return `Edit #${id}`
  }, [id, invalidId, isNew])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const amenityList = await listAmenities()
        if (cancelled) return
        setAmenities(amenityList.filter((a) => a.is_active))
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message ?? String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isNew || invalidId || id == null) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await showRestaurant(id)
        if (cancelled) return
        setName(r.name ?? '')
        setSubtitle(r.subtitle ?? '')
        setAddress(r.address ?? '')
        setContactNumber(r.contact_number ?? '')
        setPostalCode(r.postal_code ?? '')
        setLatitude(r.latitude != null ? String(r.latitude) : '')
        setLongitude(r.longitude != null ? String(r.longitude) : '')
        setRating(r.rating != null ? String(r.rating) : '')
        setQrData(r.qr_data ?? '')
        setIsActive(r.is_active ?? true)
        setHoursText((r.operating_hours ?? []).join('\n'))
        setAmenityIds(r.amenity_ids ?? [])
        setImages(
          r.images?.length
            ? r.images.map((img) => ({ url: img.url }))
            : [{ url: '' }],
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
  }, [id, invalidId, isNew])

  useEffect(() => {
    if (invalidId) {
      setError('Invalid listing ID.')
      setLoading(false)
    }
  }, [invalidId])

  function toggleAmenity(amenityId: number) {
    setAmenityIds((prev) =>
      prev.includes(amenityId)
        ? prev.filter((x) => x !== amenityId)
        : [...prev, amenityId],
    )
  }

  function buildPayload(): RestaurantPayload {
    const operatingHours = hoursText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const imagePayload = images
      .map((row, index) => ({ url: row.url.trim(), sort_order: index }))
      .filter((row) => row.url.length > 0)

    return {
      name: name.trim(),
      subtitle: subtitle.trim() || null,
      address: address.trim() || null,
      contact_number: contactNumber.trim() || null,
      postal_code: postalCode.trim() || null,
      latitude: latitude.trim() ? Number(latitude) : null,
      longitude: longitude.trim() ? Number(longitude) : null,
      rating: rating.trim() ? Number(rating) : null,
      qr_data: qrData.trim() || null,
      is_active: isActive,
      operating_hours: operatingHours.length ? operatingHours : null,
      amenity_ids: amenityIds,
      images: imagePayload,
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (isNew) {
        await createRestaurant(payload)
      } else if (id) {
        await updateRestaurant(id, payload)
      }
      nav('/restaurants')
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isNew || !id) return
    if (!window.confirm('Delete this listing? This cannot be undone.')) return

    setSaving(true)
    setError(null)
    try {
      await deleteRestaurant(id)
      nav('/restaurants')
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/restaurants" className={linkBack}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>

      {error ? <div className={`mt-4 ${errorBox}`}>{error}</div> : null}

      {loading ? (
        <div className={`mt-4 ${mutedText}`}>Loading…</div>
      ) : invalidId ? (
        <div className={`mt-4 ${mutedText}`}>
          This listing link is invalid.{' '}
          <Link to="/restaurants" className="text-blue-600 hover:text-blue-500">
            Back to listings
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900">Basic info</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className={labelClass}>Name *</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className={labelClass}>Subtitle / category</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Convenience Store, Cafe"
                />
              </label>
              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-sm text-slate-700">Active (visible in app when wired to API)</span>
              </label>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900">Location & contact</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className={labelClass}>Address</span>
                <textarea
                  className={`${inputClass} mt-1 min-h-20 resize-y`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Contact number</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Postal code</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Latitude</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Longitude</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Rating (0–5)</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className={labelClass}>QR data (optional)</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900">Operating hours</h2>
            <p className="mt-1 text-xs text-slate-400">One line per entry</p>
            <textarea
              className={`${inputClass} mt-2 min-h-24 resize-y`}
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
              placeholder={'Mon – Fri  09:00 – 22:00\nSat – Sun  10:00 – 23:00'}
            />
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900">Amenities</h2>
            <p className="mt-1 text-xs text-slate-400">
              Tick what this merchant offers — only selected items show in the app.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {amenities.map((a) => (
                <label key={a.id} className={checkboxRow}>
                  <input
                    type="checkbox"
                    checked={amenityIds.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                  />
                  <span>{a.name}</span>
                  <span className="ml-auto font-mono text-xs text-slate-400">{a.icon}</span>
                </label>
              ))}
              {amenities.length === 0 ? (
                <div className="text-sm text-slate-400">No amenities in database.</div>
              ) : null}
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Banner images</h2>
              <button
                type="button"
                className={secondaryBtnSm}
                onClick={() => setImages((prev) => [...prev, { url: '' }])}
              >
                + Add URL
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">Paste image URLs (one per carousel slide)</p>
            <div className="mt-3 space-y-2">
              {images.map((row, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={row.url}
                    onChange={(e) => {
                      const next = [...images]
                      next[index] = { url: e.target.value }
                      setImages(next)
                    }}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    className={`shrink-0 ${secondaryBtnSm}`}
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={images.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              className={primaryBtn}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {!isNew ? (
              <button
                type="button"
                disabled={saving}
                className={dangerBtn}
                onClick={handleDelete}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
