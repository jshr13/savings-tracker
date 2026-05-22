create or replace function public.create_profile_for_current_user(
  p_first_name text,
  p_last_name text,
  p_age integer,
  p_email text,
  p_phone_number text,
  p_address text
)
returns uuid
language plpgsql
as $$
declare
  v_profile_id uuid;
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    age,
    email,
    phone_number,
    address
  )
  values (
    auth.uid(),
    p_first_name,
    p_last_name,
    p_age,
    p_email,
    p_phone_number,
    p_address
  )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;
