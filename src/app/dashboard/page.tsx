'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types';

export default function DashboardPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    // Simple password protection for v1.0
    // In a real app, this would use proper authentication
    const checkAuth = () => {
        // Replace with your chosen password
        if (password === 'cpa123') {
            setAuthorized(true);
            localStorage.setItem('cpa_dashboard_auth', 'true');
        } else {
            setError('Incorrect password');
        }
    };

    useEffect(() => {
        // Check if already authorized
        if (typeof window !== 'undefined' && localStorage.getItem('cpa_dashboard_auth') === 'true') {
            setAuthorized(true);
        }

        if (!authorized) return;

        async function fetchQuestions() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw new Error(error.message);

                setQuestions(data as Question[]);

                // Initialize responses state
                const responseObj: Record<string, string> = {};
                data.forEach((q: Question) => {
                    if (q.cpa_response) {
                        responseObj[q.id] = q.cpa_response;
                    } else {
                        responseObj[q.id] = '';
                    }
                });
                setResponses(responseObj);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load questions');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, [authorized]);

    useEffect(() => {
        if (statusFilter && questions.length > 0) {
            setFilteredQuestions(questions.filter(q => q.status === statusFilter));
        } else {
            setFilteredQuestions(questions);
        }
    }, [statusFilter, questions]);

    const handleResponseChange = (id: string, value: string) => {
        setResponses(prev => ({ ...prev, [id]: value }));
    };

    const submitResponse = async (id: string) => {
        if (!responses[id]?.trim()) return;

        setSubmitting(prev => ({ ...prev, [id]: true }));

        try {
            const { error } = await supabase
                .from('questions')
                .update({
                    cpa_response: responses[id],
                    status: 'answered',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw new Error(error.message);

            // Update local state
            setQuestions(questions.map(q =>
                q.id === id
                    ? { ...q, cpa_response: responses[id], status: 'answered', updated_at: new Date().toISOString() }
                    : q
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit response');
            console.error(err);
        } finally {
            setSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    const markAsReviewed = async (id: string) => {
        try {
            const { error } = await supabase
                .from('questions')
                .update({
                    status: 'reviewed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw new Error(error.message);

            // Update local state
            setQuestions(questions.map(q =>
                q.id === id
                    ? { ...q, status: 'reviewed', updated_at: new Date().toISOString() }
                    : q
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
            console.error(err);
        }
    };

    if (!authorized) {
        return (
            <div className="container max-w-md py-20">
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold">CPA Dashboard Login</h1>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Enter dashboard password"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        checkAuth();
                                    }
                                }}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={checkAuth}
                            className="w-full"
                        >
                            Access Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-10">
                <div className="flex items-center justify-center">
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">CPA Dashboard</h1>
                <Button
                    variant="outline"
                    onClick={() => {
                        localStorage.removeItem('cpa_dashboard_auth');
                        setAuthorized(false);
                    }}
                >
                    Logout
                </Button>
            </div>

            {error && (
                <div className="mb-6 rounded-md bg-destructive/15 p-4 text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                    <StatusFilter
                        label="All"
                        count={questions.length}
                        onClick={() => router.push('/dashboard')}
                        active={!statusFilter}
                    />
                    <StatusFilter
                        label="Pending"
                        count={questions.filter(q => q.status === 'pending').length}
                        onClick={() => router.push('/dashboard?status=pending')}
                        active={statusFilter === 'pending'}
                    />
                    <StatusFilter
                        label="In Progress"
                        count={questions.filter(q => q.status === 'reviewed').length}
                        onClick={() => router.push('/dashboard?status=reviewed')}
                        active={statusFilter === 'reviewed'}
                    />
                    <StatusFilter
                        label="Answered"
                        count={questions.filter(q => q.status === 'answered').length}
                        onClick={() => router.push('/dashboard?status=answered')}
                        active={statusFilter === 'answered'}
                    />
                </div>

                {filteredQuestions.length === 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                        No questions found in this category.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredQuestions.map((question) => (
                            <div key={question.id} className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{question.user_email}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Submitted: {new Date(question.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <StatusBadge status={question.status} />
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="mb-4">
                                        <h3 className="mb-2 font-medium text-primary">Question:</h3>
                                        <p className="whitespace-pre-wrap rounded-md bg-muted p-3">{question.question_text}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium text-primary">Your Response:</h3>
                                        <Textarea
                                            value={responses[question.id] || ''}
                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                            placeholder="Type your response here..."
                                            className="min-h-[150px]"
                                            disabled={question.status === 'answered' || submitting[question.id]}
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            {question.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => markAsReviewed(question.id)}
                                                >
                                                    Mark as In Progress
                                                </Button>
                                            )}

                                            <Button
                                                onClick={() => submitResponse(question.id)}
                                                disabled={
                                                    !responses[question.id]?.trim() ||
                                                    submitting[question.id] ||
                                                    (question.status === 'answered' && question.cpa_response === responses[question.id])
                                                }
                                            >
                                                {submitting[question.id]
                                                    ? 'Submitting...'
                                                    : question.status === 'answered'
                                                        ? 'Update Response'
                                                        : 'Submit Response'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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

function StatusFilter({
    label,
    count,
    onClick,
    active
}: {
    label: string;
    count: number;
    onClick: () => void;
    active: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg border px-4 py-2 text-sm ${active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-muted/50'
                }`}
        >
            {label} ({count})
        </button>
    );
}