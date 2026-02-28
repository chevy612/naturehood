'use server'

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// BRAND PARTNERSHIP APPLICATION
// ─────────────────────────────────────────────

interface BrandPartnershipData {
  companyName: string
  website: string
  industry: string
  companySize: string
  contactName: string
  jobTitle: string
  email: string
  phone: string
  partnershipTypes: string[]
  athleteInterests: string
  budget: string
  timeline: string
  additionalInfo: string
}

export async function submitBrandPartnership(data: BrandPartnershipData) {
  const supabase = await createClient()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    const { error: insertError } = await supabase
      .from('brand_applications')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        team_size: data.companySize,
        budget: data.budget,
        timeline: data.timeline,
        project_idea: data.additionalInfo,
        target_audience: data.athleteInterests,
        job_title: data.jobTitle,
        company_size: data.companySize,
        partnership_types: data.partnershipTypes,
        athlete_interests: data.athleteInterests,
        additional_info: data.additionalInfo,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Brand partnership error:', insertError)
      return { error: 'Failed to submit application. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
