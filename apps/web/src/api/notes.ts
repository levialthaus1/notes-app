import type { Note, NoteInput, NoteUpdate } from '@notes/shared'

export class ApiError extends Error {
  status: number
  code: string
  details?: Record<string, string[]>

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const err = data?.error
    throw new ApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? `Request failed (${res.status})`,
      err?.details,
    )
  }

  return data as T
}

export const notesApi = {
  list: () => request<Note[]>('/notes'),

  create: (input: NoteInput) =>
    request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, update: NoteUpdate) =>
    request<Note>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    }),

  remove: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
}
