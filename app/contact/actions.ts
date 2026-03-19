'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { ContactFormData } from '@/lib/validations'
import { contactFormSchema } from '@/lib/validations'

export async function submitContactForm(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = contactFormSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  const supabase = await createServiceClient()

  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  })

  if (error) {
    console.error('Contact form error:', error)
    return { success: false, error: 'Failed to submit message. Please try again.' }
  }

  return { success: true }
}
