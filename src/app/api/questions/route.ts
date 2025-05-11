import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    const supabase = getSupabaseClient();

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
    } catch {
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function GET() {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('questions')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
}
