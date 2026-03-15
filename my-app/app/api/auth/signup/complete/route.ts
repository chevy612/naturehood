import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, fullName, username, password } = await req.json()

  if (!email || !fullName || !username || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()

  // Verify OTP was completed
  const { data: verifiedOtp } = await admin
    .from('otp_codes')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('used', true)
    .maybeSingle()

  if (!verifiedOtp) {
    return NextResponse.json(
      { error: 'Email verification required. Please complete the verification step.' },
      { status: 403 }
    )
  }

  // Check username uniqueness
  const { data: existingUsername } = await admin
    .from('profiles')
    .select('id')
    .eq('username', normalizedUsername)
    .maybeSingle()

  if (existingUsername) {
    return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
  }

  const supabase = await createClient()
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { full_name: fullName, role: 'athlete' } },
  })

  if (signUpError || !authData.user) {
    console.error('Sign up error:', signUpError)
    return NextResponse.json({ error: signUpError?.message ?? 'Failed to create account.' }, { status: 500 })
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: authData.user.id,
    email: normalizedEmail,
    name: fullName,
    role: 'athlete',
    username: normalizedUsername,
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    console.error('Profile upsert error:', profileError)
    return NextResponse.json(
      { error: 'Account created but profile setup failed. Please contact support.' },
      { status: 500 }
    )
  }

  await admin.from('otp_codes').delete().eq('email', normalizedEmail)

  return NextResponse.json({ success: true })
}