'use server'

import { sql } from '@/lib/db'
import type { ContactFormData } from '@/lib/validations'
import { contactFormSchema } from '@/lib/validations'

export async function submitContactForm(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = contactFormSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${parsed.data.name}, ${parsed.data.email}, ${parsed.data.subject ?? null}, ${parsed.data.message})
    `
    return { success: true }
  } catch (error) {
    console.error('Contact form error:', error)
    return { success: false, error: 'Failed to submit message. Please try again.' }
  }
}
