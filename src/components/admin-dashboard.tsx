// src/components/admin-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseClient } from '@/lib/supabase';
import { Question } from '@/types';

interface QuestionCardProps {
    question: Question;
    response: string;
    onResponseChange: (value: string) => void;
    onSubmitResponse: () => void;
    onMarkReviewed: () => void;
    submitting: boolean;
}

export default function DashboardClient() {
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

    const checkAuth = () => {
        console.log('Checking authorization');
        // Get the admin password from environment variable
        const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        
        if (!adminPassword) {
            console.error('Admin password environment variable is not set');
            setError('Authentication system error. Please contact the administrator.');
            return;
        }
        
        if (password === adminPassword) {
            console.log('Password correct, authorizing');
            setAuthorized(true);
            localStorage.setItem('cpa_dashboard_auth', 'true');
            setError(null);
        } else {
            console.log('Password incorrect');
            setError('Incorrect password');
        }
    };

    const fetchQuestions = async () => {
        console.log('Running fetchQuestions function');
        const supabase = getSupabaseClient();
        try {
            setLoading(true);
            console.log('Fetching questions from Supabase...');
            
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('created_at', { ascending: false });
            
            console.log('Fetch result:', { data, error });
            
            if (error) throw new Error(error.message);

            if (data && Array.isArray(data)) {
                setQuestions(data as Question[]);
                const respObj: Record<string, string> = {};
                data.forEach((q) => {
                    respObj[q.id] = q.cpa_response ?? '';
                });
                setResponses(respObj);
                
                if (statusFilter) {
                    setFilteredQuestions(data.filter((q) => q.status === statusFilter));
                } else {
                    setFilteredQuestions(data);
                }
            } else {
                console.error('Data is not an array or is null:', data);
                throw new Error('Invalid data format returned from the server');
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to load questions'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            localStorage.getItem('cpa_dashboard_auth') === 'true'
        ) {
            setAuthorized(true);
        }
    }, []);

    useEffect(() => {
        if (!authorized) return;
        fetchQuestions();
    }, [authorized, fetchQuestions]); // Added fetchQuestions to the dependency array

    useEffect(() => {
        if (questions.length > 0) {
            if (statusFilter) {
                setFilteredQuestions(questions.filter((q) => q.status === statusFilter));
            } else {
                setFilteredQuestions([...questions]);
            }
        }
    }, [statusFilter, questions]);

    const handleResponseChange = (id: string, value: string) => {
        setResponses((prev) => ({ ...prev, [id]: value }));
    };

    // Send email notification when a question is answered
    const sendAnswerNotification = async (question: Question) => {
        try {
            const response = await fetch('/api/email/answer-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(question),
            });
            
            if (!response.ok) {
                console.error('Email notification failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                return false;
            }
            
            const data = await response.json();
            return data.success;
        } catch (err) {
            console.error('Error sending answer notification:', err);
            return false;
        }
    };

    // Separate function to update the database
    const updateQuestionInDatabase = async (id: string, updateData: Record<string, unknown>) => {
        try {
            // Using direct fetch instead of supabase client
            console.log('Updating question in database with ID:', id);
            console.log('Update data:', updateData);
            
            // Use the REST endpoint directly with API key for full permissions
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/questions?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Database update failed:', response.status, errorText);
                throw new Error(`Database update failed: ${response.status} ${errorText}`);
            }
            
            const updatedData = await response.json();
            console.log('Database update successful with response:', updatedData);
            return updatedData[0];
            
        } catch (error) {
            console.error('Error in updateQuestionInDatabase:', error);
            throw error;
        }
    };

    const submitResponse = async (id: string) => {
        if (!responses[id]?.trim()) return;
        setSubmitting((prev) => ({ ...prev, [id]: true }));
        
        try {
            console.log('Submitting response for question:', id);
            console.log('Response content:', responses[id]);
            
            // Simple update with minimal fields
            const updateData = {
                cpa_response: responses[id],
                status: 'answered',
                updated_at: new Date().toISOString()
            };
            
            // Update the database using our direct approach
            const updatedQuestion = await updateQuestionInDatabase(id, updateData);
            console.log('Updated question from DB:', updatedQuestion);
            
            // Find the original question to create the updated version
            const originalQuestion = questions.find(q => q.id === id);
            if (!originalQuestion) {
                throw new Error('Question not found in state');
            }
            
            // Create a new object with the updated fields
            const updatedLocalQuestion: Question = {
                ...originalQuestion,
                cpa_response: responses[id],
                status: 'answered',
                updated_at: new Date().toISOString()
            };
            
            // Update local state
            setQuestions(prevQuestions => 
                prevQuestions.map(q => q.id === id ? updatedLocalQuestion : q)
            );
            
            // Try to send the email notification
            try {
                const emailSent = await sendAnswerNotification(updatedLocalQuestion);
                console.log('Email notification sent:', emailSent);
            } catch (emailError) {
                console.error('Failed to send email notification:', emailError);
                // Continue even if email fails - we still want to update the UI
            }
            
            // Fetch fresh data to ensure state is in sync with the database
            await fetchQuestions();
            
        } catch (err) {
            console.error('Error in submitResponse:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit response');
        } finally {
            setSubmitting((prev) => ({ ...prev, [id]: false }));
        }
    };

    const markAsReviewed = async (id: string) => {
        try {
            console.log('Marking question as reviewed:', id);
            
            const updateData = {
                status: 'reviewed',
                updated_at: new Date().toISOString()
            };
            
            // Use our direct database update function
            const updatedQuestion = await updateQuestionInDatabase(id, updateData);
            console.log('Question marked as reviewed, response:', updatedQuestion);
            
            // Update local state
            setQuestions(prevQuestions =>
                prevQuestions.map(q =>
                    q.id === id
                        ? { ...q, status: 'reviewed', updated_at: new Date().toISOString() }
                        : q
                )
            );
            
            // Refresh data to ensure consistency
            await fetchQuestions();
            
        } catch (err) {
            console.error('Error marking question as reviewed:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to update status'
            );
        }
    };

    if (!authorized) {
        return (
            <div className="container mx-auto px-4 max-w-md py-20">
                <div className="rounded-lg border bg-card p-6 shadow-gold/30">
                    <h1 className="mb-6 text-2xl font-bold text-primary">
                        CPA Dashboard Login
                    </h1>
                    <div className="space-y-4">
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Enter dashboard password"
                        />
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <Button onClick={checkAuth} className="w-full">
                            Access Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">CPA Dashboard</h1>
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
                        count={questions.filter((q) => q.status === 'pending').length}
                        onClick={() => router.push('/dashboard?status=pending')}
                        active={statusFilter === 'pending'}
                    />
                    <StatusFilter
                        label="In Progress"
                        count={questions.filter((q) => q.status === 'reviewed').length}
                        onClick={() => router.push('/dashboard?status=reviewed')}
                        active={statusFilter === 'reviewed'}
                    />
                    <StatusFilter
                        label="Answered"
                        count={questions.filter((q) => q.status === 'answered').length}
                        onClick={() => router.push('/dashboard?status=answered')}
                        active={statusFilter === 'answered'}
                    />
                </div>

                {loading ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        Loading questions...
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        No questions found in this category.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredQuestions.map((question) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                response={responses[question.id] || ''}
                                onResponseChange={(val) =>
                                    handleResponseChange(question.id, val)
                                }
                                onSubmitResponse={() => submitResponse(question.id)}
                                onMarkReviewed={() => markAsReviewed(question.id)}
                                submitting={submitting[question.id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Renders each question + response UI
function QuestionCard({
    question,
    response,
    onResponseChange,
    onSubmitResponse,
    onMarkReviewed,
    submitting,
}: QuestionCardProps) {
    return (
        <div className="rounded-lg border border-border bg-card shadow-gold/30">
            <div className="border-b border-border p-4">
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
                    <p className="whitespace-pre-wrap rounded-md bg-accent/20 p-3 border border-border">
                        {question.question_text}
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="font-medium text-primary">Your Response:</h3>
                    <Textarea
                        value={response}
                        onChange={(e) => onResponseChange(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[150px] bg-card border-border focus:border-primary focus:ring-primary"
                        disabled={submitting}
                    />
                    <div className="flex flex-wrap gap-2">
                        {question.status === 'pending' && (
                            <Button variant="outline" onClick={onMarkReviewed}>
                                Mark as In Progress
                            </Button>
                        )}
                        <Button
                            onClick={onSubmitResponse}
                            disabled={
                                !response.trim() ||
                                submitting ||
                                (question.status === 'answered' &&
                                    question.cpa_response === response)
                            }
                        >
                            {submitting
                                ? 'Submitting...'
                                : question.status === 'answered'
                                    ? 'Update Response'
                                    : 'Submit Response'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Question['status'] }) {
    let props: { className: string; label: string };
    switch (status) {
        case 'pending':
            props = {
                className: 'bg-yellow-900/20 text-yellow-400',
                label: 'Pending Review',
            };
            break;
        case 'reviewed':
            props = {
                className: 'bg-blue-900/20 text-blue-400',
                label: 'In Progress',
            };
            break;
        case 'answered':
            props = {
                className: 'bg-green-900/20 text-green-400',
                label: 'Answered',
            };
            break;
        default:
            props = {
                className: 'bg-gray-800/20 text-gray-400',
                label: status,
            };
    }
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${props.className}`}
        >
            {props.label}
        </span>
    );
}

function StatusFilter({
    label,
    count,
    onClick,
    active,
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
                    ? 'border-primary bg-primary/10 text-primary shadow-gold/30'
                    : 'border-border bg-card text-foreground hover:bg-accent/20 hover:shadow-gold/20'
                }`}
        >
            {label} ({count})
        </button>
    );
}