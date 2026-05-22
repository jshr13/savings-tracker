import { NextResponse } from 'next/server'

import type { SavingEntryWithBankRow } from '@/lib/saving-entries'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .rpc('get_user_saving_entries_with_bank')
    .returns<SavingEntryWithBankRow[]>()

  if (error) {
    return NextResponse.json(
      { message: 'Failed to load saving entries.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
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
      { message: 'Missing required fields for creation.' },
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

  const { data, error } = await supabase.rpc('create_user_saving_entry', {
    p_account_holder: body.account_holder,
    p_bank_id: body.bank_id,
    p_principal_amount: Number(body.principal_amount),
    p_start_date: body.start_date,
    p_notes: body.notes?.trim() || null,
  })

  if (error) {
    return NextResponse.json(
      { message: 'Failed to create saving entry.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
