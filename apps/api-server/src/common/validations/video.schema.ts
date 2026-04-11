import { z } from 'zod';
export const videoSchemas = {
  upload: z.object({ body: z.object({ title: z.string().min(3), filename: z.string() }) }),
};