export type ApiError = {
  message: string
  status?: number
}

function baseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? ''
}

function getToken() {
  return localStorage.getItem('eash_admin_token') ?? ''
}

export function setToken(token: string) {
  if (!token) localStorage.removeItem('eash_admin_token')
  else localStorage.setItem('eash_admin_token', token)
}

export function isLoggedIn() {
  return !!getToken()
}

async function parseJson(res: Response) {
  const text = await res.text()
  const trimmed = text.trimStart()
  if (trimmed.startsWith('<')) {
    throw { message: 'Backend returned HTML instead of JSON.' } satisfies ApiError
  }
  try {
    return text ? JSON.parse(text) : null
  } catch {
    throw { message: 'Invalid JSON from backend.' } satisfies ApiError
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = new Headers(init?.headers ?? {})
  headers.set('Accept', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })
  const data = await parseJson(res)

  if (!res.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : `Request failed (${res.status})`
    throw { message: msg, status: res.status } satisfies ApiError
  }
  return data as T
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ token: string }>('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export type VisaUploadRow = {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  r2_key: string
  guest_id: string
  guest_email?: string | null
  user_id?: number | null
  created_at: string
}

export type VisaUploadShow = {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  r2_key: string
  admin_note?: string | null
  signed_url: string
  expires_in: number
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export async function listVisaUploads(status: 'pending' | 'approved' | 'rejected' = 'pending') {
  return apiFetch<Paginated<VisaUploadRow>>(`/api/admin/visa-uploads?status=${status}`)
}

export async function showVisaUpload(id: number) {
  return apiFetch<VisaUploadShow>(`/api/admin/visa-uploads/${id}`)
}

export async function approveVisaUpload(id: number, adminNote?: string) {
  return apiFetch<{ ok: true }>(`/api/admin/visa-uploads/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_note: adminNote ?? null }),
  })
}

export async function rejectVisaUpload(id: number, adminNote?: string) {
  return apiFetch<{ ok: true }>(`/api/admin/visa-uploads/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_note: adminNote ?? null }),
  })
}

