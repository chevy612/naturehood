import { supabase } from './supabase'

/**
 * Checks Supabase connection by fetching user emails from the user table
 * @returns Object containing success status, data (user emails), and any error
 */
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('user_email')
    
    if (error) {
      console.error('Supabase connection error:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    console.log('✅ Connection successful! Found users:', data?.length)
    return {
      success: true,
      error: null,
      data: data
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null
    }
  }
}

/**
 * Fetches all user emails from the user table
 * @returns Array of user email strings
 */
export async function getUserEmails() {
  const { data, error } = await supabase
    .from('user')
    .select('user_email')
  
  if (error) {
    throw new Error(`Failed to fetch user emails: ${error.message}`)
  }
  
  return data?.map(user => user.user_email) || []
}
