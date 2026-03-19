'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { BulkInquiryData } from '@/lib/validations'
import { bulkInquirySchema } from '@/lib/validations'

export async function submitBulkInquiry(
  data: BulkInquiryData
): Promise<{ success: boolean; error?: string }> {
  const parsed = bulkInquirySchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  const supabase = await createServiceClient()

  const { error } = await supabase.from('bulk_inquiries').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    organization: parsed.data.organization,
    phone: parsed.data.phone,
    inquiry_type: parsed.data.inquiry_type,
    quantity_estimate: parsed.data.quantity_estimate
      ? Number(parsed.data.quantity_estimate)
      : null,
    shirt_type: parsed.data.shirt_type,
    timeline: parsed.data.timeline,
    notes: parsed.data.notes,
  })

  if (error) {
    console.error('Bulk inquiry error:', error)
    return { success: false, error: 'Failed to submit inquiry. Please try again.' }
  }

  return { success: true }
}
