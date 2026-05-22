create or replace function public.get_user_saving_entries_with_bank()
returns table (
  id uuid,
  account_holder text,
  principal_amount numeric,
  start_date date,
  notes text,
  bank_name text,
  annual_interest_rate numeric
)
language sql
as $$
  select
    se.id,
    se.account_holder,
    se.principal_amount,
    se.start_date,
    se.notes,
    b.name as bank_name,
    b.annual_interest_rate
  from public.saving_entries as se
  left join public.banks as b
    on b.id = se.bank_id
  where se.user_id = auth.uid()
  order by se.start_date desc;
$$;
