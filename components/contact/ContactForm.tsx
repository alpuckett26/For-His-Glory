'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { contactFormSchema, type ContactFormData } from '@/lib/validations'
import { submitContactForm } from '@/app/contact/actions'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    const result = await submitContactForm(data)

    if (result.success) {
      toast.success('Message sent! We\'ll respond within 24–48 hours.')
      setSubmitted(true)
      reset()
    } else {
      toast.error(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-charcoal mb-2">Message Sent</h3>
        <p className="font-body text-sm text-charcoal/60 mb-6">
          Thank you for reaching out. We'll get back to you within 24–48 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="font-body text-sm text-gold underline underline-offset-2 hover:text-gold-light transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Name <span className="text-gold">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-3 border border-charcoal/20 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 font-body text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
            Email <span className="text-gold">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-charcoal/20 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 font-body text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
          Subject
        </label>
        <input
          {...register('subject')}
          type="text"
          className="w-full px-4 py-3 border border-charcoal/20 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold"
          placeholder="What's this about?"
        />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
          Message <span className="text-gold">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full px-4 py-3 border border-charcoal/20 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold resize-none"
          placeholder="How can we help you?"
        />
        {errors.message && (
          <p className="mt-1 font-body text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
