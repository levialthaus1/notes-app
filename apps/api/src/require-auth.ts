import { createMiddleware } from 'hono/factory'
import { auth } from './auth.js'

type Session = typeof auth.$Infer.Session

export type AuthEnv = {
  Variables: { user: Session['user'] }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Please log in' } },
      401,
    )
  }

  c.set('user', session.user)
  await next()
})
