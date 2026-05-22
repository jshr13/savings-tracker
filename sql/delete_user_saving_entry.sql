create or replace function public.delete_user_saving_entry(p_id uuid)
returns boolean
language plpgsql
as $$
begin
  delete from public.saving_entries
  where id = p_id
    and user_id = auth.uid();

  return found;
end;
$$;
