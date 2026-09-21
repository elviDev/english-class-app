import { z } from "zod";

export const studyBuddyMessageSchema = z.object({
  message: z.string().trim().min(1, "Write a question before sending"),
});

export const studyBuddyRequestSchema = z.object({
  message: z.string().trim().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "ai"]),
        text: z.string(),
      })
    )
    .optional()
    .default([]),
});
