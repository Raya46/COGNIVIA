import { z } from "zod";

export const guessMeSchema = z.object({
  id: z.string().optional(),
  image: z.string(),
  title: z.string().min(3, "Title harus diisi minimal 3 karakter"),
  user_id: z.string().optional(),
});

export type GuessMe = z.infer<typeof guessMeSchema>;
