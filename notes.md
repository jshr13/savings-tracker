# Savings Tracker Learning Notes

## Purpose Of This File

This file explains the overall flow of the project we built.

It is meant to help me come back later and still understand:

- what the project does
- how Next.js and Supabase are connected
- where the frontend logic lives
- where the API logic lives
- where the database logic lives
- what setup is still required in Supabase

## Project Goal

The project is a savings tracker where:

- a user can register and log in
- each user can create saving entries
- each user can view only their own saving entries
- each user can update their own saving entries
- each user can delete their own saving entries
- interest is shown based on the selected bank and the time the money has been saved

The project uses:

- Next.js for the UI and app structure
- Supabase Auth for authentication
- Supabase Database for tables and RPC functions
- Supabase RLS for ownership and security

## Current Architecture

The current structure follows this idea:

1. Pages are for display and form interaction
2. API route handlers are for actions like GET, POST, PATCH, DELETE
3. Supabase RPC functions are for database-side logic
4. RLS policies protect rows so users only see and change their own data

This means:

- `page.tsx` should not directly contain database business logic
- `route.ts` files act like controller endpoints
- Supabase functions act like stored-procedure-style database logic

## Main Flow Of The Project

The overall request flow is:

1. User opens a page in Next.js
2. The page fetches data from an API route inside `app/api`
3. The API route uses the Supabase server client
4. The API route calls a Supabase RPC function or Auth method
5. Supabase returns data
6. The page renders the result

For form submission:

1. User fills in a form
2. Form sends a request to an API route
3. API route validates the payload
4. API route calls the proper Supabase RPC function
5. Supabase writes to the database if allowed by RLS
6. The frontend refreshes and shows the updated data

## Current Folder Structure Idea

### Display Pages

These are the pages the user sees:

- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/saving-entries/page.tsx`
- `app/saving-entries/new/page.tsx`
- `app/saving-entries/[id]/edit/page.tsx`

Purpose:

- display forms
- display dashboard data
- display edit screens

### API Route Handlers

These act like backend endpoints:

- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/banks/route.ts`
- `app/api/saving-entries/route.ts`
- `app/api/saving-entries/[id]/route.ts`

Purpose:

- login
- register
- logout
- fetch banks
- get saving entries
- create saving entry
- update saving entry
- delete saving entry

### Reusable Components

- `components/auth/auth-form.tsx`
- `components/auth/logout-button.tsx`
- `components/saving-entries/form.tsx`
- `components/saving-entries/delete-button.tsx`

Purpose:

- make the UI reusable
- avoid repeating form logic
- avoid repeating delete logic

### Shared Logic

- `lib/saving-entries.ts`
- `lib/server-api.ts`

Purpose:

- shared types
- formatting functions
- calculation helpers
- server-side request origin/cookie helpers

### Supabase Helpers

- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/middleware.ts`
- `middleware.ts`

Purpose:

- connect Next.js to Supabase
- keep auth sessions refreshed
- protect routes

## Current App Behavior

### Public Pages

- `/login`
- `/register`

These are for authentication only.

### Protected Pages

- `/saving-entries`
- `/saving-entries/new`
- `/saving-entries/[id]/edit`

These should only be accessible when logged in.

The middleware checks auth state:

- if the user is not logged in and tries to access protected pages, redirect to `/login`
- if the user is logged in and visits `/login` or `/register`, redirect to `/saving-entries`

## Authentication Flow

### Register

1. User opens `/register`
2. User enters email and password
3. Form sends `POST /api/auth/register`
4. Route calls `supabase.auth.signUp(...)`
5. Supabase creates the auth user

Depending on Supabase email confirmation settings:

- if email confirmation is off, the user can usually continue right away
- if email confirmation is on, the user must confirm email first

### Login

1. User opens `/login`
2. User enters email and password
3. Form sends `POST /api/auth/login`
4. Route calls `supabase.auth.signInWithPassword(...)`
5. Supabase creates the session
6. User is redirected to `/saving-entries`

### Logout

1. User clicks sign out
2. Button sends `POST /api/auth/logout`
3. Route calls `supabase.auth.signOut()`
4. User is redirected to `/login`

## Saving Entries Flow

### List Entries

1. User opens `/saving-entries`
2. Page fetches `/api/saving-entries`
3. API route checks the logged-in user
4. API route calls the RPC `get_user_saving_entries_with_bank`
5. Supabase returns only rows for the current user
6. The page renders the dashboard

### Create Entry

1. User opens `/saving-entries/new`
2. Page loads bank options from `/api/banks`
3. User fills out the form
4. Form sends `POST /api/saving-entries`
5. API route checks auth
6. API route calls `create_user_saving_entry`
7. Supabase inserts the row using `auth.uid()` as the owner

### Edit Entry

1. User opens `/saving-entries/[id]/edit`
2. Page fetches the current row from `/api/saving-entries/[id]`
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

## Why We Use RPC Here

This pattern was chosen because it matches stored-procedure-style thinking.

Instead of keeping all SQL join/update logic in the page or route, the logic is moved into the database.

That means:

- Next.js handles UI and request flow
- API route handles transport and validation
- Supabase RPC handles DB logic

This is similar to:

- Laravel controller calling a stored procedure
- MSSQL stored procedure handling DB actions

## Supabase Setup Instructions

These steps still matter for the project to work correctly.

### 1. Environment Variables

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 2. Enable Email Auth

In Supabase:

1. Open `Authentication`
2. Go to providers/settings
3. Enable Email authentication
4. Decide whether email confirmation is on or off

### 3. Required Tables

The app assumes these tables exist:

#### `banks`

Purpose:

- static bank reference data

Important columns:

- `id`
- `name`
- `annual_interest_rate`

This table is treated as backend-managed static data.

#### `saving_entries`

Purpose:

- user-owned savings records

Important columns:

- `id`
- `user_id`
- `bank_id`
- `account_holder`
- `principal_amount`
- `start_date`
- `notes`

### 4. Add `user_id` To `saving_entries`

Run this in Supabase `SQL Editor`:

File:

- `sql/alter_saving_entries_add_user_id.sql`

Purpose:

- connects each row to an authenticated user

### 5. Create RPC Functions

Run these in `SQL Editor`:

- `sql/get_user_saving_entries_with_bank.sql`
- `sql/get_user_saving_entry_by_id.sql`
- `sql/create_user_saving_entry.sql`
- `sql/update_user_saving_entry.sql`
- `sql/delete_user_saving_entry.sql`

What they do:

- get current user rows
- get one current user row
- create current user row
- update current user row
- delete current user row

Important concept:

- these functions use `auth.uid()`
- that means the current logged-in user controls row ownership

### 6. Enable RLS And Create Policies

Run:

- `sql/rls_saving_entries.sql`

This creates policies for:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

The rule is based on:

- `auth.uid() = user_id`

Meaning:

- users only see their own rows
- users only insert rows for themselves
- users only update their own rows
- users only delete their own rows

### 7. Banks Table Read Access

If `banks` has RLS enabled, make sure it still has a `SELECT` policy.

Why:

- the create/edit form needs to fetch available bank choices

### 8. Existing Old Data

If there are older rows in `saving_entries` with `user_id = null`, authenticated users will not see them under the new user-based rules.

Possible fixes:

- manually update old rows with a real user id
- or create fresh rows while logged in

## Important Lessons Learned

- Next.js folder structure can define both pages and API routes
- `route.ts` is similar to a controller endpoint
- Supabase RPC is a good equivalent to stored-procedure-style logic
- RLS is not optional once ownership matters
- `auth.uid()` is the key idea behind user-owned rows in Supabase
- pages should focus on display
- API routes should focus on request handling
- database functions should focus on DB logic

## Current Recommended Testing Flow

After Supabase is fully configured, test in this order:

1. Register a user
2. Log in
3. Open `/saving-entries`
4. Create a saving entry
5. Edit the saving entry
6. Delete the saving entry
7. Confirm another user cannot see those rows

## Mental Model To Remember

For this project:

- Page = UI
- `route.ts` = controller/backend endpoint
- Supabase RPC = stored procedure/database logic
- RLS = row ownership security
- Supabase Auth = login/session source

That is the current full flow of the project.
