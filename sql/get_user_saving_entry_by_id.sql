create or replace function public.get_user_saving_entry_by_id(p_id uuid)
returns table (
  id uuid,
  account_holder text,
  bank_id uuid,
  principal_amount numeric,
  start_date date,
  notes text
)
language sql
as $$
  select
    se.id,
    se.account_holder,
    se.bank_id,
    se.principal_amount,
    se.start_date,
    se.notes
  from public.saving_entries as se
  where se.id = p_id
    and se.user_id = auth.uid();
$$;
