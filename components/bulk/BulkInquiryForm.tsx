'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { bulkInquirySchema, type BulkInquiryData } from '@/lib/validations'
import { INQUIRY_TYPES } from '@/lib/constants'
import { submitBulkInquiry } from '@/app/bulk-orders/actions'

export function BulkInquiryForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BulkInquiryData>({
    resolver: zodResolver(bulkInquirySchema),
  })

  const onSubmit = async (data: BulkInquiryData) => {
    const result = await submitBulkInquiry(data)

    if (result.success) {
      toast.success('Inquiry submitted! We\'ll send a quote within 24–48 hours.')
      setSubmitted(true)
      reset()
    } else {
      toast.error(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 border border-warm-gray bg-white px-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-charcoal mb-2">Inquiry Received!</h3>
        <p className="font-body text-sm text-charcoal/60 mb-6 max-w-sm mx-auto">
          Thank you for reaching out. Our team will review your request and send a custom quote within 24–48 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="font-body text-sm text-gold underline underline-offset-2 hover:text-gold-light transition-colors"
        >
          Submit another inquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white border border-warm-gray p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Full Name <span className="text-gold">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="Pastor John Smith"
          />
          {errors.name && <p className="mt-1 font-body text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Email <span className="text-gold">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="pastor@church.com"
          />
          {errors.email && <p className="mt-1 font-body text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Organization / Church
          </label>
          <input
            {...register('organization')}
            type="text"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="Grace Community Church"
          />
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Phone
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Inquiry Type
          </label>
          <select
            {...register('inquiry_type')}
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold bg-white"
          >
            <option value="">Select type...</option>
            {INQUIRY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Quantity Estimate
          </label>
          <input
            {...register('quantity_estimate')}
            type="number"
            min="1"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="e.g. 50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Shirt Style Preference
          </label>
          <input
            {...register('shirt_type')}
            type="text"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="e.g. Unisex tees, hoodies..."
          />
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Timeline / Event Date
          </label>
          <input
            {...register('timeline')}
            type="text"
            className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
            placeholder="e.g. Need by March 15th"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
          Additional Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold resize-none"
          placeholder="Tell us about your vision, design ideas, budget, or any special requests..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Inquiry — Get a Free Quote'}
      </button>

      <p className="font-body text-xs text-charcoal/40 text-center">
        No commitment required. We'll follow up with a custom quote within 48 hours.
      </p>
    </form>
  )
}
