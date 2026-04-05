import { supabase } from './supabase'
import logger from './logger'

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
      logger.error('Supabase connection error:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    logger.debug('Connection successful! Found users:', data?.length)
    return {
      success: true,
      error: null,
      data: data
    }
  } catch (err) {
    logger.error('Unexpected error:', err)
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
  try {
    const { data, error } = await supabase
      .from('user')
      .select('user_email')
    
    if (error) {
      logger.error('Failed to fetch user emails:', error.message)
      return []
    }
    
    return data?.map(user => user.user_email) || []
  } catch (err) {
    logger.error('Error fetching user emails:', err instanceof Error ? err.message : 'Unknown error')
    return []
  }
}
