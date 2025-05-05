// src/app/QuestionForm.tsx
'use client';

import { useState, useRef, useEffect, type MutableRefObject } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, type QuestionFormValues } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export default function QuestionForm() {
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // use a mutable ref so we can assign .current
    const textareaRef = useRef<HTMLTextAreaElement | null>(null) as MutableRefObject<
        HTMLTextAreaElement | null
    >;

    // Choose a random welcome message on initial render
    const welcomeMessages = [
        "What accounting question can I help with today?",
        "Need help with QuickBooks or bookkeeping?",
        "Have a financial reporting question?",
        "Confused about accounting principles?",
        "What's your accounting challenge?",
    ];
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    const welcomeMessage = welcomeMessages[randomIndex];

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            email: '',
            question: '',
        },
    });

    // Auto-resize textarea
    const autoResizeTextarea = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
        ta.style.overflowY = ta.scrollHeight > 300 ? 'auto' : 'hidden';
    };

    // Watch for changes in form values to trigger resize
    useEffect(() => {
        const sub = form.watch(() => setTimeout(autoResizeTextarea, 0));
        return () => sub.unsubscribe();
    }, [form]);

    // Initial setup and event binding
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        setTimeout(autoResizeTextarea, 0);
        ta.addEventListener('input', autoResizeTextarea);
        return () => ta.removeEventListener('input', autoResizeTextarea);
    }, []);

    // Handle the initial question submission
    const handleQuestionSubmit = () => {
        const questionValue = form.getValues().question;
        if (questionValue.length < 10) {
            form.setError('question', {
                type: 'manual',
                message: 'Your question must be at least 10 characters',
            });
            return;
        }
        setShowEmailPopup(true);
    };

    // Close email popup
    const handleClosePopup = () => setShowEmailPopup(false);

    // Final submit
    async function onSubmit(values: QuestionFormValues) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Check existing usage
            const { data: usageData, error: usageError } = await supabase
                .from('email_usage')
                .select('*')
                .eq('email', values.email)
                .single();
            if (usageError && usageError.code !== 'PGRST116') {
                throw new Error('Error checking previous questions');
            }

            if (usageData) {
                const { error: updateError } = await supabase
                    .from('email_usage')
                    .update({
                        question_count: usageData.question_count + 1,
                        last_question_at: new Date().toISOString(),
                    })
                    .eq('email', values.email);
                if (updateError) throw new Error('Error updating usage data');
            } else {
                const { error: insertError } = await supabase
                    .from('email_usage')
                    .insert([
                        {
                            email: values.email,
                            question_count: 1,
                            last_question_at: new Date().toISOString(),
                        },
                    ]);
                if (insertError) throw new Error('Error recording usage data');
            }

            // Insert the question
            const { error: questionError } = await supabase
                .from('questions')
                .insert([
                    {
                        user_email: values.email,
                        question_text: values.question,
                        status: 'pending',
                    },
                ]);
            if (questionError) throw new Error('Error submitting your question');

            setSubmitSuccess(true);
            setShowEmailPopup(false);
            form.reset();
        } catch (err) {
            setSubmitError(
                err instanceof Error ? err.message : 'An unexpected error occurred'
            );
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (submitSuccess) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <h3 className="text-2xl font-semibold" style={{ color: '#cd9f27' }}>
                        Question Submitted!
                    </h3>
                    <p className="text-muted-foreground">
                        Thank you for your question. Our CPA will review it and respond as soon as possible.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        We&apos;ll send the answer to the email address you provided.
                    </p>
                    <Button
                        className="mt-4 text-white"
                        style={{ backgroundColor: '#cd9f27', borderColor: '#cd9f27' }}
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
        <>
            <div className="max-w-4xl mx-auto mt-8">
                <h2
                    className="text-4xl font-semibold mb-8 text-center text-white"
                    style={{ marginBottom: '2rem' }}
                >
                    {welcomeMessage}
                </h2>

                <Form form={form}>
                    <form className="space-y-4">
                        <FormField
                            name="question"
                            control={form.control}
                            render={(field) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <textarea
                                                {...field}
                                                ref={(el) => {
                                                    field.ref(el);
                                                    textareaRef.current = el;
                                                }}
                                                placeholder="Ask your accounting or QuickBooks question here..."
                                                disabled={isSubmitting}
                                                className="w-full text-lg resize-none overflow-hidden"
                                                style={{
                                                    backgroundColor: '#303030',
                                                    borderColor: '#cd9f27',
                                                    borderWidth: '1px',
                                                    fontSize: '18px',
                                                    borderRadius: '24px',
                                                    padding: '0.75rem 1.5rem',
                                                    paddingRight: '4rem',
                                                    minHeight: '100px',
                                                    maxHeight: '300px',
                                                    outline: 'none',
                                                    lineHeight: '1.5',
                                                }}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    autoResizeTextarea();
                                                }}
                                            />

                                            <div className="absolute right-4 top-14">
                                                <Button
                                                    type="button"
                                                    className="rounded-full flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: '#cd9f27',
                                                        padding: 0,
                                                        borderRadius: '50%',
                                                        width: '10px',
                                                        height: '10px',
                                                        minWidth: '36px',
                                                        minHeight: '36px',
                                                    }}
                                                    disabled={isSubmitting}
                                                    onClick={handleQuestionSubmit}
                                                    aria-label="Submit question"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="white"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M12 19V5" />
                                                        <path d="M5 12l7-7 7 7" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                {showEmailPopup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4" style={{ color: '#cd9f27' }}>
                                Almost there!
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Please provide your email address so we can send you the answer to your question.
                            </p>

                            <FormField
                                name="email"
                                control={form.control}
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Your Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="your@email.com"
                                                disabled={isSubmitting}
                                                className="rounded-[16px] text-lg"
                                                style={{
                                                    backgroundColor: '#303030',
                                                    borderColor: '#cd9f27',
                                                    fontSize: '16px',
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {submitError && (
                                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4">
                                    {submitError}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-[12px]"
                                    onClick={handleClosePopup}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 text-white rounded-[12px]"
                                    style={{ backgroundColor: '#cd9f27' }}
                                    disabled={isSubmitting}
                                    onClick={form.handleSubmit(onSubmit)}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Always-visible footer notice */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center">
                <div className="max-w-4xl w-full text-center bg-background py-2">
                    <p className="text-xs text-muted-foreground">
                        By submitting, you agree that this service provides general accounting guidance only. We do not cover tax, legal, or complex accounting topics.
                    </p>
                </div>
            </div>
        </>
    );
}
