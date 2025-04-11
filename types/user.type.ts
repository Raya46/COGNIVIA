import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["penderita", "caregiver"]),
  safezone: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export interface SafeZone {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface AddressType {
  username: string;
  district: string;
  city: string;
  province: string;
}
