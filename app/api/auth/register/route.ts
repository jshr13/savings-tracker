import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string
    password?: string
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: 'Email and password are required.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
  })

  if (error) {
    return NextResponse.json(
      { message: 'Failed to register.', details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    requiresEmailConfirmation: !data.session,
  })
}
