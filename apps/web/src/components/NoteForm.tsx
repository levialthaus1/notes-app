import { useState } from 'react'
import type { Note, NoteInput } from '@notes/shared'
import { ApiError } from '../api/notes'

type Props = {
  initial?: Note
  submitLabel: string
  onSubmit: (input: NoteInput) => Promise<void>
  onCancel?: () => void
}

export function NoteForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        title,
        body,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      if (!initial) {
        setTitle('')
        setBody('')
        setTags('')
      }
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setError(Object.values(err.details).flat().join(' '))
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="note-form"
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit()
      }}
    >
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Write something…"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <div className="actions">
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
