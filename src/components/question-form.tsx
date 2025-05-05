'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, type QuestionFormValues } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

export default function QuestionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            email: '',
            question: '',
        },
    });

    async function onSubmit(values: QuestionFormValues) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // First check if this email has already submitted a question
            const { data: usageData, error: usageError } = await supabase
                .from('email_usage')
                .select('*')
                .eq('email', values.email)
                .single();

            if (usageError && usageError.code !== 'PGRST116') {
                throw new Error('Error checking previous questions');
            }

            // If email already exists in system, update the count
            if (usageData) {
                // V1.0 doesn't have question limits yet, but we'll track for future
                const { error: updateError } = await supabase
                    .from('email_usage')
                    .update({
                        question_count: usageData.question_count + 1,
                        last_question_at: new Date().toISOString(),
                    })
                    .eq('email', values.email);

                if (updateError) throw new Error('Error updating usage data');
            } else {
                // First time user, insert a new record
                const { error: insertUsageError } = await supabase
                    .from('email_usage')
                    .insert([
                        {
                            email: values.email,
                            question_count: 1,
                            last_question_at: new Date().toISOString()
                        }
                    ]);

                if (insertUsageError) throw new Error('Error recording usage data');
            }

            // Insert the question
            const { error: questionError } = await supabase
                .from('questions')
                .insert([
                    {
                        user_email: values.email,
                        question_text: values.question,
                        status: 'pending'
                    }
                ]);

            if (questionError) throw new Error('Error submitting your question');

            // Success!
            setSubmitSuccess(true);
            form.reset();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (submitSuccess) {
        return (
            <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <h3 className="text-2xl font-semibold text-primary">Question Submitted!</h3>
                    <p className="text-muted-foreground">
                        Thank you for your question. Our CPA will review it and respond as soon as possible.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        We'll send the answer to the email address you provided.
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => {
                            setSubmitSuccess(false);
                            form.reset();
                        }}
                    >
                        Ask Another Question
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <Form form={form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-primary">Ask Your Accounting Question</h2>
                        <p className="text-sm text-muted-foreground">
                            Get answers to your basic accounting and QuickBooks questions from a certified CPA.
                        </p>
                    </div>

                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="your@email.com"
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="question"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Question</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ask your accounting or QuickBooks question here..."
                                        {...field}
                                        rows={6}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {submitError && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {submitError}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Question'}
                    </Button>

                    <div className="text-xs text-muted-foreground">
                        <p>
                            By submitting, you agree that this service provides general accounting guidance only.
                            We do not cover tax, legal, or complex accounting topics.
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}