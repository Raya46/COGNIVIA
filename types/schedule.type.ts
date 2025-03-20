import { z } from "zod";

export const scheduleTypeEnum = z.enum(["kegiatan", "Rutinitas"]);

export const scheduleSchema = z.object({
  id: z.string().optional(), // optional karena akan di-generate
  title: z.string().min(1, "Judul harus diisi"),
  type: scheduleTypeEnum,
  time: z.string().min(1, "Waktu harus diisi"),
  date: z.string().min(1, "Tanggal harus diisi"),
  description: z.string().optional(),
  user_id: z.string().optional(),
});

export type Schedule = z.infer<typeof scheduleSchema>;
export type ScheduleType = z.infer<typeof scheduleTypeEnum>;
