import { Hono } from 'hono'
import { db } from './db.js'
import { notesRoutes } from './notes/notes.routes.js'
import { auth } from './auth.js'

export const app = new Hono().basePath('/api')

app.get('/health', async (c) => {
  try {
    await db.command({ ping: 1 })
    return c.json({ status: 'ok', db: 'up' })
  } catch (err) {
    console.error('Database health check failed:', err)
    return c.json({ status: 'error', db: 'down' }, 503)
  }
})

app.all('/auth/*', (c) => auth.handler(c.req.raw))
app.route('/notes', notesRoutes)

// Unknown routes
app.notFound((c) => {
  return c.json(
    { error: { code: 'NOT_FOUND', message: 'Route not found' } },
    404,
  )
})

// Any error nothing else caught
app.onError((err, c) => {
  console.error(err)
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
    500,
  )
})
