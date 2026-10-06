import type { ObjectId, WithId } from 'mongodb'
import type { Note, NoteInput, NoteUpdate } from '@notes/shared'
import { db } from '../db.js'

// How a note is stored in MongoDB
type NoteDoc = {
  userId: string
  title: string
  body: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const notes = db.collection<NoteDoc>('notes')

// Speeds up "this user's notes, newest first". Safe to run on every start.
export async function ensureNoteIndexes() {
  await notes.createIndex({ userId: 1, updatedAt: -1 })
}

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

export async function listNotes(userId: string): Promise<Note[]> {
  const docs = await notes
    .find({ userId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray()
  return docs.map(toNote)
}

export async function getNote(
  userId: string,
  id: ObjectId,
): Promise<Note | null> {
  const doc = await notes.findOne({ _id: id, userId })
  return doc ? toNote(doc) : null
}

export async function createNote(
  userId: string,
  input: NoteInput,
): Promise<Note> {
  const now = new Date()
  const doc: NoteDoc = { ...input, userId, createdAt: now, updatedAt: now }
  const result = await notes.insertOne(doc)
  return toNote({ ...doc, _id: result.insertedId })
}

export async function updateNote(
  userId: string,
  id: ObjectId,
  update: NoteUpdate,
): Promise<Note | null> {
  const doc = await notes.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...update, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return doc ? toNote(doc) : null
}

export async function deleteNote(
  userId: string,
  id: ObjectId,
): Promise<boolean> {
  const result = await notes.deleteOne({ _id: id, userId })
  return result.deletedCount === 1
}
