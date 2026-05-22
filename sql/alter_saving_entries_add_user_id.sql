alter table public.saving_entries
add column if not exists user_id uuid references auth.users(id);
