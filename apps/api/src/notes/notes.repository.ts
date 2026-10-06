import type { ObjectId, WithId } from 'mongodb'
import type { Note, NoteInput, NoteUpdate } from '@notes/shared'
import { db } from '../db.js'

// How a note is stored in MongoDB
type NoteDoc = {
  title: string
  body: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const notes = db.collection<NoteDoc>('notes')

// Convert a database document into what the API returns
function toNote(doc: WithId<NoteDoc>): Note {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    body: doc.body,
    tags: doc.tags,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export async function listNotes(): Promise<Note[]> {
  const docs = await notes.find().sort({ updatedAt: -1 }).limit(100).toArray()
  return docs.map(toNote)
}

export async function getNote(id: ObjectId): Promise<Note | null> {
  const doc = await notes.findOne({ _id: id })
  return doc ? toNote(doc) : null
}

export async function createNote(input: NoteInput): Promise<Note> {
  const now = new Date()
  const doc: NoteDoc = { ...input, createdAt: now, updatedAt: now }
  const result = await notes.insertOne(doc)
  return toNote({ ...doc, _id: result.insertedId })
}

export async function updateNote(
  id: ObjectId,
  update: NoteUpdate,
): Promise<Note | null> {
  const doc = await notes.findOneAndUpdate(
    { _id: id },
    { $set: { ...update, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return doc ? toNote(doc) : null
}

export async function deleteNote(id: ObjectId): Promise<boolean> {
  const result = await notes.deleteOne({ _id: id })
  return result.deletedCount === 1
}
