import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/logger'

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

  // Check if an auth user already exists for this email (orphaned from a prior partial signup)
  const { data: existingAuthUser } = await admin
    .schema('auth')
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  let userId: string

  if (existingAuthUser) {
    // Orphaned auth user — update password and reuse their ID
    const { error: updateError } = await admin.auth.admin.updateUserById(existingAuthUser.id, {
      password,
      user_metadata: { full_name: fullName, role: 'athlete' },
    })
    if (updateError) {
      logger.error('Update user error:', updateError)
      return NextResponse.json({ error: 'Failed to update account.' }, { status: 500 })
    }
    userId = existingAuthUser.id
  } else {
    // New user — create with email already confirmed (app performed OTP verification)
    const { data: authData, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'athlete' },
    })
    if (createError || !authData.user) {
      logger.error('Create user error:', createError)
      return NextResponse.json({ error: createError?.message ?? 'Failed to create account.' }, { status: 500 })
    }
    userId = authData.user.id
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email: normalizedEmail,
    name: fullName,
    role: 'athlete',
    username: normalizedUsername,
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    logger.error('Profile upsert error:', profileError)
    return NextResponse.json(
      { error: 'Account created but profile setup failed. Please contact support.' },
      { status: 500 }
    )
  }

  await admin.from('otp_codes').delete().eq('email', normalizedEmail)

  return NextResponse.json({ success: true })
}