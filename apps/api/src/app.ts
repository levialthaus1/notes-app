import { Hono } from 'hono'
import { db } from './db.js'

export const app = new Hono().basePath('/api')

app.get('/health', async (c) => {
  try {
    await db.command({ ping: 1 })
    return c.json({ status: 'ok', db: 'up' })
  } catch (error) {
    console.error('Database health check failed:', error)
    return c.json({ status: 'error', db: 'down' }, 503)
  }
})
