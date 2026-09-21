import { z } from "zod";

export const newAssignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Instructions are required"),
  dueDate: z.string().optional(),
});

export const submissionSchema = z.object({
  content: z.string().trim().min(1, "Write your answer before submitting"),
});

export const gradeSchema = z.object({
  grade: z.string().trim().min(1, "Enter a grade"),
  feedback: z.string().optional(),
});
