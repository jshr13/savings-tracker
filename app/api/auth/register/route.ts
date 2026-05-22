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
    options: {
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        age: Number(body.age),
        email: body.email,
        phone_number: body.phone_number,
        address: body.address,
      },
    },
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
