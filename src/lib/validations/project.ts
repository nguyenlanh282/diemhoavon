import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống').max(100),
  description: z.string().max(500).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
