import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - these are public values (anon key is safe to expose)
const SUPABASE_URL = 'https://litbmjdtaofepkgquqgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdGJtamR0YW9mZXBrZ3F1cWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODM2MTcsImV4cCI6MjA4MjM1OTYxN30.ZJiF_I5vzQOJu6x_GiAPFsokVtXtwOL7RDRB40LTF_A';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Client-side Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Supabase is always configured now with hardcoded fallback
export const isSupabaseConfigured = true;

// Type for user profile data stored in Supabase
export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'premium';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

// Type for synced retirement data
export interface SyncedRetirementData {
  id: string;
  user_id: string;
  retirement_data: Record<string, unknown>;
  social_security_data: Record<string, unknown>;
  net_worth_data: Record<string, unknown>;
  budget_data: Record<string, unknown>;
  mortgages: Record<string, unknown>[];
  updated_at: string;
}
