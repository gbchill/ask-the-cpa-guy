// src/components/status-check.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase';
import { Question } from '@/types';

const statusSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
});
type StatusFormValues = z.infer<typeof statusSchema>;

export default function StatusCheck() {
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);

    const form = useForm<StatusFormValues>({
        resolver: zodResolver(statusSchema),
        defaultValues: { email: '' },
    });

    async function onSubmit(values: StatusFormValues) {
        setIsChecking(true);
        setCheckError(null);

        // get a Supabase client at runtime
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('user_email', values.email)
                .order('created_at', { ascending: false });

            if (error) throw new Error('Error fetching your questions');

            if (!data || data.length === 0) {
                setCheckError('No questions found for this email address');
                setQuestions(null);
            } else {
                setQuestions(data as Question[]);
            }
        } catch (err) {
            setCheckError(
                err instanceof Error ? err.message : 'An unexpected error occurred'
            );
            setQuestions(null);
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto bg-[#303030] text-gray-100 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Check Question Status</h2>
            <p className="text-sm text-gray-300 mb-6">
                Enter your email to view the status of your submitted questions.
            </p>

            <Form
                form={form}
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex gap-2 mb-6"
            >
                <FormField
                    name="email"
                    control={form.control}
                    render={({ name, onChange, onBlur, ref }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input
                                    id={name}
                                    placeholder="you@example.com"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    ref={ref}
                                    disabled={isChecking}
                                    className="w-full bg-[#2f2c2c] border-gray-600 text-gray-100 focus:border-yellow-400 focus:ring-yellow-400"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isChecking}>
                    {isChecking ? 'Checking…' : 'Check Status'}
                </Button>
            </Form>

            {checkError && (
                <div className="text-sm text-red-400 mb-6">{checkError}</div>
            )}

            {questions && (
                <ul className="space-y-6">
                    {questions.map((q) => (
                        <li key={q.id} className="border-t border-gray-700 pt-4">
                            {/* Render each question’s status, response, etc. */}
                            <p className="font-medium text-lg">{q.question_text}</p>
                            <p className="text-sm mt-1">
                                Status: <span className="font-semibold">{q.status}</span>
                            </p>
                            {q.cpa_response && (
                                <blockquote className="mt-2 p-3 bg-gray-800 rounded">
                                    <p className="italic">“{q.cpa_response}”</p>
                                </blockquote>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
