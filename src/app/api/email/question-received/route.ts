import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendQuestionReceivedEmail, sendAdminNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email, question } = await request.json();
        
        if (!email || !question) {
            return NextResponse.json(
                { error: 'Email and question are required' },
                { status: 400 }
            );
        }
        
        // Send confirmation email to the user
        const userEmailSuccess = await sendQuestionReceivedEmail(email, question);
        
        // Send notification to the admin
        const adminEmailSuccess = await sendAdminNotificationEmail(email, question);
        
        if (!userEmailSuccess || !adminEmailSuccess) {
            console.error('Failed to send emails:', {
                userEmailSuccess,
                adminEmailSuccess
            });
            
            return NextResponse.json(
                { error: 'Failed to send one or more emails' },
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