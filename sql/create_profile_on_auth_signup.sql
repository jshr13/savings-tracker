create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    (new.raw_user_meta_data ->> 'age')::integer,
    coalesce(new.raw_user_meta_data ->> 'email', new.email),
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'address'
  )
  on conflict (id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    age = excluded.age,
    email = excluded.email,
    phone_number = excluded.phone_number,
    address = excluded.address;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
