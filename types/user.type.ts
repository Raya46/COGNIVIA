import { z } from "zod";
export const userSchema = z.object({
  username: z
    .string()
    .min(3, "username must be at least 3 characters long")
    .optional(),
  email: z.string().email("invalid email address"),
  password: z.string().min(8, "password must be at least 8 characters long"),
});

export type User = z.infer<typeof userSchema>;
