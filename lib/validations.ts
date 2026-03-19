import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const bulkInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().optional(),
  phone: z.string().optional(),
  inquiry_type: z.enum([
    'church',
    'ministry',
    'conference',
    'youth_group',
    'event',
    'family_reunion',
    'other',
  ]).optional(),
  quantity_estimate: z.number().positive().optional().or(z.string().transform(val => val ? parseInt(val) : undefined)),
  shirt_type: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

export const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type BulkInquiryData = z.infer<typeof bulkInquirySchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
