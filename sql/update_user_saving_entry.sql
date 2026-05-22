create or replace function public.update_user_saving_entry(
  p_id uuid,
  p_account_holder text,
  p_bank_id uuid,
  p_principal_amount numeric,
  p_start_date date,
  p_notes text default null
)
returns boolean
language plpgsql
as $$
begin
  update public.saving_entries
  set
    account_holder = p_account_holder,
    bank_id = p_bank_id,
    principal_amount = p_principal_amount,
    start_date = p_start_date,
    notes = p_notes
  where id = p_id
    and user_id = auth.uid();

  return found;
end;
$$;
