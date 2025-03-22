import { z } from "zod";

export const guessQASchema = z.object({
  id: z.string(),
  guess_me_id: z.string(),
  question_id: z.string(),
  answer_id: z.string(),
  questions: z.object({
    id: z.string(),
    question: z.string(),
  }),
  answers: z.object({
    id: z.string(),
    answer: z.string(),
    user_input: z.string(),
    user_input_value: z.string(),
  }),
});

export type GuessQA = z.infer<typeof guessQASchema>;
