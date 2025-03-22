import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3, "Question harus diisi minimal 3 karakter"),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

export type Question = z.infer<typeof questionSchema>;
