import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

import type { BankOption } from '@/lib/saving-entries'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('banks')
    .select('id, name, annual_interest_rate')
    .order('name', { ascending: true })
    .returns<BankOption[]>()

  if (error) {
    return NextResponse.json(
      { message: 'Failed to load banks.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}
