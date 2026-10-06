import { useEffect, useState } from 'react'
import type { Note, NoteInput } from '@notes/shared'
import { notesApi } from '../api/notes'
import { NoteForm } from './NoteForm'
import { NoteCard } from './NoteCard'

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    notesApi
      .list()
      .then(setNotes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(input: NoteInput) {
    const note = await notesApi.create(input)
    setNotes((prev) => [note, ...prev])
  }

  async function handleUpdate(id: string, input: NoteInput) {
    const note = await notesApi.update(id, input)
    setNotes((prev) => [note, ...prev.filter((n) => n.id !== id)])
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return
    try {
      await notesApi.remove(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  return (
    <>
      <NoteForm submitLabel="Add note" onSubmit={handleCreate} />

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading notes…</p>}
      {!loading && !error && notes.length === 0 && (
        <p className="empty">No notes yet. Write your first one above.</p>
      )}

      <section className="notes">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isEditing={editingId === note.id}
            onEdit={() => setEditingId(note.id)}
            onCancelEdit={() => setEditingId(null)}
            onSave={(input) => handleUpdate(note.id, input)}
            onDelete={() => void handleDelete(note.id)}
          />
        ))}
      </section>
    </>
  )
}
