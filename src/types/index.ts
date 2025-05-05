export type Question = {
    id: string;
    user_email: string;
    question_text: string;
    status: 'pending' | 'reviewed' | 'answered';
    created_at: string;
    updated_at: string;
    ai_response: string | null;
    cpa_response: string | null;
    category: string | null;
};

export type EmailUsage = {
    email: string;
    question_count: number;
    last_question_at: string;
};