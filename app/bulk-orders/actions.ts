'use server'

import { sql } from '@/lib/db'
import type { BulkInquiryData } from '@/lib/validations'
import { bulkInquirySchema } from '@/lib/validations'

export async function submitBulkInquiry(
  data: BulkInquiryData
): Promise<{ success: boolean; error?: string }> {
  const parsed = bulkInquirySchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await sql`
      INSERT INTO bulk_inquiries (name, email, organization, phone, inquiry_type, quantity_estimate, shirt_type, timeline, notes)
      VALUES (
        ${parsed.data.name},
        ${parsed.data.email},
        ${parsed.data.organization ?? null},
        ${parsed.data.phone ?? null},
        ${parsed.data.inquiry_type ?? null},
        ${parsed.data.quantity_estimate ? Number(parsed.data.quantity_estimate) : null},
        ${parsed.data.shirt_type ?? null},
        ${parsed.data.timeline ?? null},
        ${parsed.data.notes ?? null}
      )
    `
    return { success: true }
  } catch (error) {
    console.error('Bulk inquiry error:', error)
    return { success: false, error: 'Failed to submit inquiry. Please try again.' }
  }
}
