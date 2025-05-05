// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Creates (and caches) a Supabase client *at request time*,
 * so it never runs at module‐import time during the build.
 */
export function getSupabaseClient(): SupabaseClient {
    if (cached) return cached;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    }

    cached = createClient(url, key);
    return cached;
}
