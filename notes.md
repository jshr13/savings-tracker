# Savings Tracker Project Notes

## Purpose Of This File

This file explains the full current state of the project.

It is meant to help me remember:

- what the project is doing now
- how the code is structured
- how Next.js, API routes, Supabase Auth, RPC, and RLS work together
- what setup is still required in Supabase
- what known issues or important lessons already came up

## Project Summary

This project is a savings tracker built with:

- Next.js for the frontend and app structure
- Supabase Auth for login and registration
- Supabase Database for tables and SQL functions
- Supabase RLS for row ownership and data protection

The current product idea is:

- a user can register and log in
- a user has a profile
- a user can create saving entries
- a user can view only their own saving entries
- a user can update only their own saving entries
- a user can delete only their own saving entries
- each saving entry is tied to a bank
- banks are treated as static backend-managed reference data
- the UI computes estimated interest over time

## Main Design Principle

The current project follows this layered structure:

1. Pages handle display and form interaction
2. API routes handle request/response flow
3. Supabase RPC handles database-side logic
4. RLS protects row ownership

This means:

- `page.tsx` should not contain heavy DB logic
- `route.ts` acts like a controller endpoint
- Supabase functions act like stored-procedure-style database logic
- RLS decides whether the user is allowed to see or change a row

## Overall Request Flow

### For Reading Data

1. User opens a Next.js page
2. The page fetches from an API route inside `app/api`
3. The API route gets the current session/user from Supabase
4. The API route runs a Supabase query or RPC
5. Supabase returns data
6. The page renders the result

### For Writing Data

1. User fills out a form
2. The form sends a request to an API route
3. The API route validates the payload
4. The API route checks the authenticated user
5. The API route calls the proper Supabase RPC or table update
6. Supabase applies RLS and function logic
7. The frontend refreshes and shows the updated result

## Current Folder Structure And Purpose

### Display Pages

- `app/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/profile/page.tsx`
- `app/saving-entries/page.tsx`
- `app/saving-entries/new/page.tsx`
- `app/saving-entries/[id]/edit/page.tsx`

Purpose:

- route users to the correct page
- display forms
- display the dashboard
- display edit screens

### API Route Handlers

- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/profile/route.ts`
- `app/api/banks/route.ts`
- `app/api/saving-entries/route.ts`
- `app/api/saving-entries/[id]/route.ts`

Purpose:

- login
- register
- logout
- load/update the current user profile
- fetch bank options
- fetch saving entries
- create saving entries
- update saving entries
- delete saving entries

### Reusable Components

- `components/auth/auth-form.tsx`
- `components/auth/logout-button.tsx`
- `components/profile/profile-form.tsx`
- `components/saving-entries/form.tsx`
- `components/saving-entries/delete-button.tsx`

Purpose:

- avoid repeating form logic
- keep page files smaller
- keep UI behavior reusable

### Shared Logic

- `lib/server-api.ts`
- `lib/saving-entries.ts`
- `lib/profiles.ts`

Purpose:

- shared types
- server fetch helpers
- formatting functions
- interest calculations

### Supabase Helpers

- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/middleware.ts`
- `middleware.ts`

Purpose:

- create Supabase clients
- keep sessions refreshed
- redirect auth pages and protected pages correctly

### SQL Files

All files under `sql/` are project-side copies of SQL that must still be run in Supabase.

Important idea:

- SQL files in the repo are references/versioned scripts
- the real function or table only exists after running the SQL in Supabase

## Current Routes

### Public Routes

- `/login`
- `/register`

These are for users who are not logged in yet.

### Protected Routes

- `/profile`
- `/saving-entries`
- `/saving-entries/new`
- `/saving-entries/[id]/edit`

These should only be accessible when logged in.

### Root Route

- `/`

Behavior:

- if logged in, redirect to `/saving-entries`
- if not logged in, redirect to `/login`

## Authentication Flow

### Register

The registration form currently asks for:

- first name
- last name
- age
- email
- phone number
- address
- password

Flow:

1. User opens `/register`
2. User fills out the full form
3. Form sends `POST /api/auth/register`
4. API route calls `supabase.auth.signUp(...)`
5. Supabase creates the auth user
6. If a session is immediately available, the route tries to create the matching profile row

Important detail:

- if Supabase email confirmation is enabled, a session may not exist immediately after signup
- that means the profile row may not be created automatically at that moment

This is one current limitation/known behavior.

### Login

1. User opens `/login`
2. User enters email and password
3. Form sends `POST /api/auth/login`
4. API route calls `supabase.auth.signInWithPassword(...)`
5. Supabase creates the session
6. User is redirected to `/saving-entries`

### Logout

1. User clicks sign out
2. Button sends `POST /api/auth/logout`
3. Route calls `supabase.auth.signOut()`
4. User is redirected to `/login`

## Profile Flow

### Why A `profiles` Table Exists

Supabase Auth already gives:

- `auth.users`

But the app also needs:

- first name
- last name
- age
- email
- phone number
- address

So the project uses:

- `auth.users` for authentication identity
- `public.profiles` for app-specific user information

This means:

- no extra `users` table is needed
- `profiles` is the application-level user table

### Profile Page

Route:

- `/profile`

Purpose:

- show current user information
- allow editing of the profile

Flow:

1. Page fetches `/api/profile`
2. API route checks the logged-in user
3. API route reads the matching row from `profiles`
4. Form displays the current values
5. On submit, form sends `PATCH /api/profile`
6. API route updates `profiles`
7. If email changes, the route also requests an auth email update

### Important Profile Issue We Encountered

We saw this error:

- `Cannot coerce the result to a single JSON object`

Meaning:

- the app expected one profile row
- but no matching profile row existed yet for that auth user

This happens when:

- the auth user exists
- but `profiles` does not yet have a row for that same user id

Manual fix:

1. go to `Authentication`
2. copy the user id
3. insert a row into `profiles` using that same id

## Saving Entries Flow

### Concept

Each saving entry belongs to one authenticated user and one bank.

The ownership rule is based on:

- `saving_entries.user_id = auth.uid()`

### List Entries

1. User opens `/saving-entries`
2. Page fetches `/api/saving-entries`
3. API route checks auth
4. API route calls `get_user_saving_entries_with_bank`
5. Supabase returns only the current user’s rows
6. Page renders the dashboard

### Create Entry

1. User opens `/saving-entries/new`
2. Page fetches bank options from `/api/banks`
3. User fills the form
4. Form sends `POST /api/saving-entries`
5. API route checks auth
6. API route calls `create_user_saving_entry`
7. Supabase inserts the row using `auth.uid()` as owner

### Edit Entry

1. User opens `/saving-entries/[id]/edit`
2. Page fetches `/api/saving-entries/[id]`
3. User edits the form
4. Form sends `PATCH /api/saving-entries/[id]`
5. API route checks auth
6. API route calls `update_user_saving_entry`
7. Supabase updates the row only if it belongs to the current user

### Delete Entry

1. User clicks delete
2. Button sends `DELETE /api/saving-entries/[id]`
3. API route checks auth
4. API route calls `delete_user_saving_entry`
5. Supabase deletes the row only if it belongs to the current user

## Why RPC Was Chosen

This pattern fits a backend/stored-procedure mindset.

Instead of pushing all join/update logic into pages or plain route code, the project places important DB logic in Supabase functions.

That means:

- Next.js page = UI layer
- `route.ts` = controller/API layer
- Supabase RPC = database logic layer

This is very similar to:

- frontend calling backend endpoint
- backend endpoint calling stored procedure

## Current Tables

### `banks`

Purpose:

- static bank reference data

Important columns:

- `id`
- `name`
- `annual_interest_rate`

Current project assumption:

- bank rows are managed through the backend / manual DB setup
- no bank CRUD UI is part of the app right now

### `profiles`

Purpose:

- store application-specific user details

Important columns:

- `id`
- `first_name`
- `last_name`
- `age`
- `email`
- `phone_number`
- `address`
- `created_at`

Relationship:

- `profiles.id` should match `auth.users.id`

### `saving_entries`

Purpose:

- store the user’s saving records

Important columns:

- `id`
- `user_id`
- `bank_id`
- `account_holder`
- `principal_amount`
- `start_date`
- `notes`

Relationships:

- `saving_entries.user_id` -> `auth.users.id`
- `saving_entries.bank_id` -> `banks.id`

## Supabase Setup Required

### 1. Environment Variables

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 2. Enable Email Auth

In Supabase:

1. open `Authentication`
2. enable email/password auth
3. decide whether email confirmation is on or off

### 3. Create Or Verify The Tables

You should have:

- `banks`
- `profiles`
- `saving_entries`

### 4. Run SQL For Profiles

Run these in Supabase `SQL Editor`:

- `sql/create_profiles_table.sql`
- `sql/create_profile_for_current_user.sql`
- `sql/rls_profiles.sql`

Purpose:

- create the profiles table
- create the profile creation RPC
- protect profiles with RLS

### 5. Run SQL For Saving Entries Ownership

Run:

- `sql/alter_saving_entries_add_user_id.sql`

Purpose:

- add the `user_id` column if needed

### 6. Run SQL For Saving Entry RPC

Run:

- `sql/get_user_saving_entries_with_bank.sql`
- `sql/get_user_saving_entry_by_id.sql`
- `sql/create_user_saving_entry.sql`
- `sql/update_user_saving_entry.sql`
- `sql/delete_user_saving_entry.sql`

Purpose:

- list rows for current user
- get one row for current user
- create one row for current user
- update one row for current user
- delete one row for current user

### 7. Run SQL For Saving Entry RLS

Run:

- `sql/rls_saving_entries.sql`

This creates policies for:

- select
- insert
- update
- delete

Based on:

- `auth.uid() = user_id`

### 8. Banks Access

If `banks` has RLS enabled, make sure it has a read policy for the current app flow.

Why:

- the saving-entry form needs to load bank options

### 9. Existing Old Data

If older `saving_entries` rows have `user_id = null`, they will not show under the user-owned rules.

Possible fixes:

- manually attach those rows to a real user id
- or create fresh rows while logged in

### 10. Existing Old Users

If a user already exists in `auth.users` but has no `profiles` row, the profile page will fail to load useful data until a matching profile row is created.

Manual fix:

- insert the missing row into `profiles`

## Current Known Limitations

### Profile Creation Depends On Session Availability

Current registration tries to create the profile row only if the signup returns a session immediately.

If email confirmation is enabled:

- auth user may be created first
- but profile row may still be missing

Possible future improvements:

- use a DB trigger
- use a Supabase webhook/edge function
- create the profile on first successful login

### Banks Are Static In The Current App

Right now:

- bank rows are assumed to be inserted manually or through backend-only processes
- no bank maintenance UI is included

## Important Lessons Learned

- Next.js folder structure controls pages and API routes
- `route.ts` works like a controller endpoint
- Supabase RPC works well as a stored-procedure-style layer
- RLS is part of the feature, not just a security afterthought
- `auth.uid()` is the key to user-owned rows
- `auth.users` is not the same as a profile table
- a page can work only if the supporting DB rows and policies actually exist
- SQL files in the project do not automatically create functions in Supabase until they are run

## Current Recommended Test Flow

After Supabase setup is complete, test in this order:

1. Register a new user
2. Log in
3. Open `/profile`
4. Confirm profile row exists and can be edited
5. Open `/saving-entries`
6. Create a saving entry
7. Edit the saving entry
8. Delete the saving entry
9. Confirm another user cannot see those rows

## Mental Model To Remember

For this project:

- Page = UI
- `route.ts` = controller/API layer
- Supabase RPC = database logic
- RLS = ownership rules
- Supabase Auth = identity/session
- `profiles` = application-level user details
- `saving_entries` = user-owned financial data

That is the current full flow and current state of the project.
