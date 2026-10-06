import { Hono, type Context } from 'hono'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { NoteInputSchema, NoteUpdateSchema } from '@notes/shared'
import { requireAuth, type AuthEnv } from '../require-auth.js'
import * as repo from './notes.repository.js'

export const notesRoutes = new Hono<AuthEnv>()

// Every notes route requires a logged-in user
notesRoutes.use('*', requireAuth)

// MongoDB ids are 24 hex characters. Reject anything else before querying.
function parseId(id: string): ObjectId | null {
  return /^[a-f\d]{24}$/i.test(id) ? new ObjectId(id) : null
}

function notFound(c: Context) {
  return c.json(
    { error: { code: 'NOT_FOUND', message: 'Note not found' } },
    404,
  )
}

function validationError(c: Context, error: z.ZodError) {
  return c.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: z.flattenError(error).fieldErrors,
      },
    },
    400,
  )
}

// Read the JSON body, or null if it isn't valid JSON
async function readJson(c: Context): Promise<unknown> {
  return c.req.json().catch(() => null)
}

notesRoutes.get('/', async (c) => {
  const userId = c.get('user').id
  return c.json(await repo.listNotes(userId))
})

notesRoutes.get('/:id', async (c) => {
  const userId = c.get('user').id
  const id = parseId(c.req.param('id'))
  if (!id) return notFound(c)

  const note = await repo.getNote(userId, id)
  return note ? c.json(note) : notFound(c)
})

notesRoutes.post('/', async (c) => {
  const userId = c.get('user').id
  const parsed = NoteInputSchema.safeParse(await readJson(c))
  if (!parsed.success) return validationError(c, parsed.error)

  const note = await repo.createNote(userId, parsed.data)
  return c.json(note, 201)
})

notesRoutes.patch('/:id', async (c) => {
  const userId = c.get('user').id
  const id = parseId(c.req.param('id'))
  if (!id) return notFound(c)

  const parsed = NoteUpdateSchema.safeParse(await readJson(c))
  if (!parsed.success) return validationError(c, parsed.error)

  const note = await repo.updateNote(userId, id, parsed.data)
  return note ? c.json(note) : notFound(c)
})

notesRoutes.delete('/:id', async (c) => {
  const userId = c.get('user').id
  const id = parseId(c.req.param('id'))
  if (!id) return notFound(c)

  const deleted = await repo.deleteNote(userId, id)
  return deleted ? c.body(null, 204) : notFound(c)
})
