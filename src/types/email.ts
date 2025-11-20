import { z } from "zod";

export const sendWelcomeEmailSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export type SendWelcomeEmailData = z.infer<typeof sendWelcomeEmailSchema>;