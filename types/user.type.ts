import { z } from "zod";
export const userSchema = z.object({
  username: z
    .string()
    .min(3, "username must be at least 3 characters long")
    .optional(),
  email: z.string().email("invalid email address"),
  password: z.string().min(8, "password must be at least 8 characters long"),
  role: z.string().default("penderita"),
  safezone: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export interface SafeZone {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface AddressType {
  name: string;
  district: string;
  city: string;
  province: string;
}
