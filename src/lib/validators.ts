import { z } from 'zod';

export const questionSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address',
    }),
    question: z
        .string()
        .min(10, {
            message: 'Your question must be at least 10 characters',
        })
        .max(500, {
            message: 'Your question cannot exceed 500 characters',
        }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;