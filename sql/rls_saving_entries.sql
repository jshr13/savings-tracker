alter table public.saving_entries enable row level security;

create policy "Users can view their own saving entries"
on public.saving_entries
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can insert their own saving entries"
on public.saving_entries
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can update their own saving entries"
on public.saving_entries
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can delete their own saving entries"
on public.saving_entries
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);
