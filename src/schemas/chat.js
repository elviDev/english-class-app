import { z } from "zod";

export const chatMessageSchema = z.object({
  text: z.string().trim().min(1, "Write a message before sending"),
});
