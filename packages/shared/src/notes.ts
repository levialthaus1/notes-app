import { z } from 'zod'

// What the API sends back to the client
export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// What the client sends when creating a note
export const NoteInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  body: z.string().max(50_000),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
})

// Updates: every field is optional
export const NoteUpdateSchema = NoteInputSchema.partial()

export type Note = z.infer<typeof NoteSchema>
export type NoteInput = z.infer<typeof NoteInputSchema>
export type NoteUpdate = z.infer<typeof NoteUpdateSchema>
