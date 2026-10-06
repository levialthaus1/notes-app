import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './env.js'
import { ensureNoteIndexes } from './notes/notes.repository.js'

await ensureNoteIndexes()

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API running on http://localhost:${info.port}`)
})
