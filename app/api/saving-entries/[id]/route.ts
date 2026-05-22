import { NextRequest, NextResponse } from 'next/server'

import type { SavingEntryDetailRow } from '@/lib/saving-entries'
import { createClient } from '@/utils/supabase/server'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .rpc('get_user_saving_entry_by_id', {
      p_id: id,
    })
    .returns<SavingEntryDetailRow[]>()

  if (error) {
    return NextResponse.json(
      { message: 'Failed to load saving entry.', details: error.message },
      { status: 500 }
    )
  }

  const entry = data?.[0]

  if (!entry) {
    return NextResponse.json({ message: 'Saving entry not found.' }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const body = (await request.json()) as {
    account_holder?: string
    bank_id?: string
    principal_amount?: string
    start_date?: string
    notes?: string
  }

  if (
    !body.account_holder ||
    !body.bank_id ||
    !body.principal_amount ||
    !body.start_date
  ) {
    return NextResponse.json(
      { message: 'Missing required fields for update.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const { data, error } = await supabase.rpc('update_user_saving_entry', {
    p_id: id,
    p_account_holder: body.account_holder,
    p_bank_id: body.bank_id,
    p_principal_amount: Number(body.principal_amount),
    p_start_date: body.start_date,
    p_notes: body.notes?.trim() || null,
  })

  if (error) {
    return NextResponse.json(
      { message: 'Failed to update saving entry.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const { data, error } = await supabase.rpc('delete_user_saving_entry', {
    p_id: id,
  })

  if (error) {
    return NextResponse.json(
      { message: 'Failed to delete saving entry.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data })
}
