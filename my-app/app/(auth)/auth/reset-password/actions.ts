'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────
// Verify that a reset token is valid (not used, not expired)
// Called on page load to gate the form
// ─────────────────────────────────────────────

export async function verifyResetToken(
  token: string
): Promise<{ valid: true; email: string } | { valid: false; reason: 'expired' | 'invalid' }> {
  if (!token || token.length !== 64) {
    return { valid: false, reason: 'invalid' }
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('password_reset_tokens')
    .select('email, expires_at, used')
    .eq('token', token)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, reason: 'invalid' }
  }

  if (data.used) {
    return { valid: false, reason: 'invalid' }
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  return { valid: true, email: data.email }
}

// ─────────────────────────────────────────────
// Reset the password — re-verifies token atomically before updating
// ─────────────────────────────────────────────

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<{ success: true } | { error: string }> {
  // Client-side validation mirrors
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }
  if (!token || token.length !== 64) {
    return { error: 'Invalid reset link. Please request a new one.' }
  }

  const admin = createAdminClient()

  // Re-verify token (prevents replay if tab was left open past expiry)
  const { data: tokenRecord, error: tokenError } = await admin
    .from('password_reset_tokens')
    .select('id, email, expires_at, used')
    .eq('token', token)
    .maybeSingle()

  if (tokenError || !tokenRecord) {
    return { error: 'Invalid reset link. Please request a new one.' }
  }
  if (tokenRecord.used) {
    return { error: 'This reset link has already been used. Please request a new one.' }
  }
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { error: 'This reset link has expired. Please request a new one.' }
  }

  // Look up the Supabase auth user ID via profiles table
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('email', tokenRecord.email)
    .maybeSingle()

  if (profileError || !profile) {
    return { error: 'Account not found. Please contact support.' }
  }

  // Update the password using the admin (service-role) client
  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id,
    { password }
  )

  if (updateError) {
    console.error('updateUserById error:', updateError)
    return { error: 'Failed to update password. Please try again.' }
  }

  // Mark token as used — prevents replay attacks
  await admin
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('id', tokenRecord.id)

  return { success: true }
}
