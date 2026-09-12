import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email().max(320),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8).max(128),
});
