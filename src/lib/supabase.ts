// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';


const svUrl = process.env.SUPABASE_URL;
const svKey = process.env.SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient {
    if (!svUrl || !svKey) {
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment'
        );
    }
    return createClient(svUrl, svKey);
}


const brUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const brKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(brUrl, brKey);
