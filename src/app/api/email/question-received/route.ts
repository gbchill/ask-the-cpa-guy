// src/app/api/email/question-received/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendQuestionReceivedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email, question } = await request.json();
        
        if (!email || !question) {
            return NextResponse.json(
                { error: 'Email and question are required' },
                { status: 400 }
            );
        }
        
        const success = await sendQuestionReceivedEmail(email, question);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in question-received email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}