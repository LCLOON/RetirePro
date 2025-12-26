-- RetirePro Database Schema for Supabase
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'premium')),
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User retirement data table
create table if not exists public.user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  retirement_data jsonb default '{}'::jsonb,
  social_security_data jsonb default '{}'::jsonb,
  net_worth_data jsonb default '{}'::jsonb,
  budget_data jsonb default '{}'::jsonb,
  mortgages jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

-- Profiles policies: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- User data policies: Users can only access their own data
create policy "Users can view own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id);

create policy "Users can delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for faster lookups
create index if not exists idx_user_data_user_id on public.user_data(user_id);
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
