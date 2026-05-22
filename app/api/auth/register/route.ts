import { NextResponse } from 'next/server'

import type { RegisterPayload } from '@/lib/profiles'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RegisterPayload>

  if (
    !body.first_name ||
    !body.last_name ||
    !body.age ||
    !body.email ||
    !body.phone_number ||
    !body.address ||
    !body.password
  ) {
    return NextResponse.json(
      { message: 'Complete registration details are required.' },
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

  if (data.user && data.session) {
    const { error: profileError } = await supabase.rpc('create_profile_for_current_user', {
      p_first_name: body.first_name,
      p_last_name: body.last_name,
      p_age: Number(body.age),
      p_email: body.email,
      p_phone_number: body.phone_number,
      p_address: body.address,
    })

    if (profileError) {
      return NextResponse.json(
        { message: 'User created but profile creation failed.', details: profileError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    requiresEmailConfirmation: !data.session,
  })
}
