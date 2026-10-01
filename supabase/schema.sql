-- ====================================================================
-- suvAI v2 — Production Database Schema & Security Policies (Supabase)
-- ====================================================================

-- 1. Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  country text default 'US',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Preferences Table
create table if not exists public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  diet text default 'all', -- 'vegetarian', 'non-vegetarian', 'vegan', 'eggetarian', 'pescatarian', 'all'
  favorite_cuisines text[] default '{}',
  disliked_ingredients text[] default '{}',
  allergies text[] default '{}',
  preferred_cooking_time text default '30-60', -- '<15', '15-30', '30-60', '60+'
  cooking_skill text default 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  calorie_preference text default 'moderate',
  spice_preference text default 'medium', -- 'mild', 'medium', 'spicy'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Recipes Cache / Normalized Table
create table if not exists public.recipes (
  id text primary key,
  external_id text unique,
  title text not null,
  description text,
  image_url text,
  cuisine text default 'general',
  diet text default 'all',
  dish_types text[] default '{}',
  ready_minutes integer default 30,
  servings integer default 4,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  ingredients jsonb default '[]'::jsonb,
  instructions jsonb default '[]'::jsonb,
  source text default 'spoonacular',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Saved Recipes Table
create table if not exists public.saved_recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id text references public.recipes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, recipe_id)
);

-- 5. Recipe Interactions Table (Views, Likes, Saves, Cooks)
create table if not exists public.recipe_interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id text not null,
  interaction_type text not null, -- 'view', 'save', 'unsave', 'like', 'dislike', 'cook', 'search_click', 'recommendation_click'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Meal Plans Table
create table if not exists public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  meal_type text not null, -- 'breakfast', 'lunch', 'dinner', 'snack'
  recipe_id text references public.recipes(id) on delete cascade,
  custom_name text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Grocery Items Table
create table if not exists public.grocery_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  quantity numeric default 1,
  unit text default '',
  category text default 'Other', -- 'Produce', 'Dairy', 'Meat', 'Seafood', 'Pantry', 'Bakery', 'Frozen', 'Other'
  checked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
create index if not exists idx_saved_recipes_user on public.saved_recipes(user_id);
create index if not exists idx_interactions_user on public.recipe_interactions(user_id);
create index if not exists idx_interactions_recipe on public.recipe_interactions(recipe_id);
create index if not exists idx_meal_plans_user_date on public.meal_plans(user_id, date);
create index if not exists idx_grocery_items_user on public.grocery_items(user_id);
create index if not exists idx_recipes_cuisine on public.recipes(cuisine);
create index if not exists idx_recipes_diet on public.recipes(diet);

-- ====================================================================
-- Row Level Security (RLS) Configuration
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.recipes enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.recipe_interactions enable row level security;
alter table public.meal_plans enable row level security;
alter table public.grocery_items enable row level security;

-- Recipes: Publicly readable for all authenticated and anonymous clients
create policy "Recipes are viewable by all"
  on public.recipes for select
  using (true);

create policy "Authenticated users can insert cached recipes"
  on public.recipes for insert
  to authenticated
  with check (true);

-- Profiles: Users can view and update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Preferences: Users can access and update only their own preferences
create policy "Users can view own preferences"
  on public.user_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Saved Recipes: Strict per-user access
create policy "Users can view own saved recipes"
  on public.saved_recipes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own saved recipes"
  on public.saved_recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own saved recipes"
  on public.saved_recipes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Recipe Interactions: Users can log and view their own activity
create policy "Users can view own interactions"
  on public.recipe_interactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can record own interactions"
  on public.recipe_interactions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Meal Plans: Strict per-user access
create policy "Users can view own meal plans"
  on public.meal_plans for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can manage own meal plans"
  on public.meal_plans for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Grocery Items: Strict per-user access
create policy "Users can view own grocery items"
  on public.grocery_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can manage own grocery items"
  on public.grocery_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ====================================================================
-- Automated User Profile Creation Trigger
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'country', 'US')
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute after signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
