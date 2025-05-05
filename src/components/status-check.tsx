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
    email: z.string().email({
        message: 'Please enter a valid email address',
    }),
});

type StatusFormValues = z.infer<typeof statusSchema>;

export default function StatusCheck() {
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);

    const form = useForm<StatusFormValues>({
        resolver: zodResolver(statusSchema),
        defaultValues: {
            email: '',
        },
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
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary">Check Question Status</h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to check the status of your submitted questions.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <div className="flex space-x-2">
                                        <FormControl>
                                            <Input
                                                placeholder="your@email.com"
                                                {...field}
                                                disabled={isChecking}
                                            />
                                        </FormControl>
                                        <Button type="submit" disabled={isChecking}>
                                            {isChecking ? 'Checking...' : 'Check Status'}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                {checkError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {checkError}
                    </div>
                )}

                {questions && questions.length > 0 && (
                    <div className="mt-6 space-y-6">
                        <h3 className="text-lg font-medium">Your Questions</h3>
                        <div className="space-y-4">
                            {questions.map((question) => (
                                <div key={question.id} className="rounded-md border p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Submitted: {new Date(question.created_at).toLocaleDateString()}
                                        </span>
                                        <StatusBadge status={question.status} />
                                    </div>
                                    <p className="mb-4 font-medium">{question.question_text}</p>

                                    {question.status === 'answered' && question.cpa_response && (
                                        <div className="mt-4 rounded-md bg-primary/10 p-3">
                                            <h4 className="mb-2 font-medium text-primary">CPA Response:</h4>
                                            <p className="text-sm">{question.cpa_response}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Question['status'] }) {
    const getStatusProps = () => {
        switch (status) {
            case 'pending':
                return {
                    className: 'bg-yellow-100 text-yellow-800',
                    label: 'Pending Review'
                };
            case 'reviewed':
                return {
                    className: 'bg-blue-100 text-blue-800',
                    label: 'In Progress'
                };
            case 'answered':
                return {
                    className: 'bg-green-100 text-green-800',
                    label: 'Answered'
                };
            default:
                return {
                    className: 'bg-gray-100 text-gray-800',
                    label: status
                };
        }
    };

    const { className, label } = getStatusProps();

    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}