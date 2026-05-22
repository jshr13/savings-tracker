create or replace function public.create_user_saving_entry(
  p_account_holder text,
  p_bank_id uuid,
  p_principal_amount numeric,
  p_start_date date,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  insert into public.saving_entries (
    user_id,
    bank_id,
    account_holder,
    principal_amount,
    start_date,
    notes
  )
  values (
    auth.uid(),
    p_bank_id,
    p_account_holder,
    p_principal_amount,
    p_start_date,
    p_notes
  )
  returning id into v_id;

  return v_id;
end;
$$;
