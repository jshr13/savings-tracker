import { NextResponse } from 'next/server'

import type { ProfileFormValues, ProfileRow } from '@/lib/profiles'
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
    .from('profiles')
    .select('id, first_name, last_name, age, email, phone_number, address')
    .eq('id', user.id)
    .maybeSingle()
    .returns<ProfileRow>()

  if (error) {
    return NextResponse.json(
      { message: 'Failed to load profile.', details: error.message },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      {
        message:
          'No profile row exists yet for this user. Create the profile row in Supabase or sign up again after the profile SQL is in place.',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<ProfileFormValues>
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  if (
    !body.first_name ||
    !body.last_name ||
    !body.age ||
    !body.email ||
    !body.phone_number ||
    !body.address
  ) {
    return NextResponse.json(
      { message: 'Complete profile details are required.' },
      { status: 400 }
    )
  }

  let emailRequiresConfirmation = false

  if (body.email !== user.email) {
    const { data: emailData, error: emailError } = await supabase.auth.updateUser({
      email: body.email,
    })

    if (emailError) {
      return NextResponse.json(
        { message: 'Failed to update auth email.', details: emailError.message },
        { status: 500 }
      )
    }

    emailRequiresConfirmation = Boolean(emailData.user?.new_email)
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: body.first_name,
      last_name: body.last_name,
      age: Number(body.age),
      email: body.email,
      phone_number: body.phone_number,
      address: body.address,
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { message: 'Failed to update profile.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, emailRequiresConfirmation })
}
