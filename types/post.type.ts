import { z } from "zod";
export const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "title must be at least 3 characters long"),
  caption: z.string().min(3, "Captions must be at least 3 characters long"),
  image_date: z.string(),
  image: z.string(),
  memory_word: z.string(),
  user_id: z.string(),
});

export type Post = z.infer<typeof postSchema>;
