import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const PHOTO_BUCKET = "photos";
export const MAX_LIBRARY_PHOTOS = 10;
export const MAX_ORDER_PHOTOS = 10;
export const RETENTION_DAYS = 3;
export const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;
