import { Hono } from 'hono'

export const app = new Hono().basePath('/api')

app.get('/health', (c) => {
    return c.json({ status: 'ok' })
})