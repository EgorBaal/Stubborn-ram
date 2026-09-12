import { z } from "zod";

export const createLeadSchema = z.object({
  full_name: z.string().trim().min(2).max(200),

  age: z.number().int().min(1).max(120),

  height: z.number().int().min(50).max(250),

  weight: z.number().min(20).max(500),

  goals: z.array(z.string().trim().max(500)).default([]),

  goal_details: z.string().trim().max(5000).default(""),

  training_experience: z.string().trim().max(5000).default(""),

  training_experience_details: z.string().trim().max(5000).default(""),

  difficulties: z.array(z.string().trim().max(500)).default([]),

  difficulties_details: z.string().trim().max(5000).default(""),

  ideal_results: z.array(z.string().trim().max(500)).default([]),

  ideal_result_details: z.string().trim().max(5000).default(""),

  report_preferences: z.array(z.string().trim().max(500)).default([]),

  report_preferences_details: z.string().trim().max(5000).default(""),

  telegram: z.string().trim().max(200).default(""),

  vk: z.string().trim().max(500).default(""),

  instagram: z.string().trim().max(500).default(""),

  phone: z.string().trim().max(100).default(""),
});
