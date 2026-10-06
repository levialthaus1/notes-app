import type { Note, NoteInput } from '@notes/shared'
import { NoteForm } from './NoteForm'

type Props = {
  note: Note
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: (input: NoteInput) => Promise<void>
  onDelete: () => void
}

export function NoteCard({
  note,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: Props) {
  if (isEditing) {
    return (
      <NoteForm
        initial={note}
        submitLabel="Save"
        onSubmit={onSave}
        onCancel={onCancelEdit}
      />
    )
  }

  return (
    <article className="note">
      <h2>{note.title}</h2>
      {note.body && <p className="body">{note.body}</p>}

      {note.tags.length > 0 && (
        <ul className="tags">
          {note.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      <footer>
        <time dateTime={note.updatedAt}>
          {new Date(note.updatedAt).toLocaleString()}
        </time>
        <div className="actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </footer>
    </article>
  )
}
