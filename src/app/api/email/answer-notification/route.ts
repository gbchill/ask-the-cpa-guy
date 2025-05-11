import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendAnswerNotificationEmail } from '@/lib/email';
import { Question } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const question = await request.json() as Question;
        
        if (!question || !question.user_email || !question.cpa_response) {
            return NextResponse.json(
                { error: 'Valid question with email and response is required' },
                { status: 400 }
            );
        }
        
        const success = await sendAnswerNotificationEmail(question);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in answer-notification email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}