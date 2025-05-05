import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Insert the question into the database
        const { error } = await supabase
            .from('questions')
            .insert([data]);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function GET() {
    // This is just a placeholder - you might want to implement this later
    return NextResponse.json({ message: 'Questions API endpoint' });
}