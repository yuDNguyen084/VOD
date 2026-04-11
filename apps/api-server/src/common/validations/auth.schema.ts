import { z } from 'zod';
export const authSchemas = {
  register: z.object({ body: z.object({ email: z.string().email(), password: z.string().min(6) }) }),
  login: z.object({ body: z.object({ email: z.string().email(), password: z.string() }) }),
  refresh: z.object({ body: z.object({ refreshToken: z.string() }) })
};