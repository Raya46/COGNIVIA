import { z } from "zod";

export const answerSchema = z.object({
  id: z.string().optional(),
  answer: z.string().min(1, "Jawaban harus diisi"), // Ubah min menjadi 1
  user_input: z.string().optional(), // Buat optional karena ini akan diisi kemudian
  user_input_value: z.boolean().default(false).optional(),
  user_id: z.string().optional(),
});

export type Answer = z.infer<typeof answerSchema>;
