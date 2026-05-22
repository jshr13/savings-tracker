create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age integer not null,
  email text not null,
  phone_number text not null,
  address text not null,
  created_at timestamptz not null default now()
);
