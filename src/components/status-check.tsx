// src/components/status-check.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
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

        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('user_email', values.email)
                .order('created_at', { ascending: false });

            if (error) throw new Error('Error fetching your questions');

            if (data.length === 0) {
                setCheckError('No questions found for this email address');
                setQuestions(null);
            } else {
                setQuestions(data as Question[]);
            }
        } catch (err) {
            setCheckError(err instanceof Error ? err.message : 'An unexpected error occurred');
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 mb-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input
                                        placeholder="you@example.com"
                                        {...field}
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
                </form>
            </Form>

            {checkError && (
                <div className="text-sm text-red-400 mb-6">
                    {checkError}
                </div>
            )}

            {questions && (
                <ul className="space-y-6">
                    {questions.map((q) => (
                        <li key={q.id} className="border-t border-gray-700 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">
                                    {new Date(q.created_at).toLocaleDateString()}
                                </span>
                                <StatusBadge status={q.status} />
                            </div>
                            <p className="mt-2 font-medium">{q.question_text}</p>
                            {q.status === 'answered' && q.cpa_response && (
                                <div className="mt-4 bg-[#2f2c2c] p-4 rounded">
                                    <h4 className="font-medium mb-2">CPA Response:</h4>
                                    <p className="text-sm">{q.cpa_response}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Question['status'] }) {
    const mapping = {
        pending: { label: 'Pending Review', color: 'bg-yellow-900/20 text-yellow-300' },
        reviewed: { label: 'In Progress', color: 'bg-blue-900/20 text-blue-300' },
        answered: { label: 'Answered', color: 'bg-green-900/20 text-green-300' },
    } as const;

    const { label, color } = mapping[status] ?? { label: status, color: 'bg-gray-700/20 text-gray-400' };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}
