import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client - only create if env vars are present
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
