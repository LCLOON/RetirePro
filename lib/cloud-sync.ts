import { supabase } from './supabase';
import type { RetirementData, SocialSecurityData, NetWorthData, BudgetData, MortgageEntry } from './types';

export interface CloudData {
  retirement_data: RetirementData;
  social_security_data: SocialSecurityData;
  net_worth_data: NetWorthData;
  budget_data: BudgetData;
  mortgages: MortgageEntry[];
}

// Save user data to Supabase
export async function saveToCloud(userId: string, data: CloudData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        retirement_data: data.retirement_data,
        social_security_data: data.social_security_data,
        net_worth_data: data.net_worth_data,
        budget_data: data.budget_data,
        mortgages: data.mortgages,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving to cloud:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Cloud save error:', err);
    return { success: false, error: 'Failed to save to cloud' };
  }
}

// Load user data from Supabase
export async function loadFromCloud(userId: string): Promise<{ success: boolean; data?: CloudData; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - not an error, just new user
        return { success: true, data: undefined };
      }
      console.error('Error loading from cloud:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        retirement_data: data.retirement_data,
        social_security_data: data.social_security_data,
        net_worth_data: data.net_worth_data,
        budget_data: data.budget_data,
        mortgages: data.mortgages || [],
      },
    };
  } catch (err) {
    console.error('Cloud load error:', err);
    return { success: false, error: 'Failed to load from cloud' };
  }
}

// Update user's subscription tier in Supabase
export async function updateSubscriptionTier(
  userId: string, 
  tier: 'free' | 'pro' | 'premium',
  stripeCustomerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        subscription_tier: tier,
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Subscription update error:', err);
    return { success: false, error: 'Failed to update subscription' };
  }
}

// Get user's subscription tier from Supabase
export async function getSubscriptionTier(userId: string): Promise<{ tier: 'free' | 'pro' | 'premium'; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { tier: 'free' }; // New user defaults to free
      }
      return { tier: 'free', error: error.message };
    }

    return { tier: data.subscription_tier || 'free' };
  } catch (err) {
    console.error('Get tier error:', err);
    return { tier: 'free', error: 'Failed to get subscription tier' };
  }
}

// Delete user data from cloud
export async function deleteFromCloud(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Cloud delete error:', err);
    return { success: false, error: 'Failed to delete from cloud' };
  }
}
