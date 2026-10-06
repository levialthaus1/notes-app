import { z } from 'zod'

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().default('notes-app'),
  PORT: z.coerce.number().default(3000),
})

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(result.error)}`,
  )
}

export const env = result.data
