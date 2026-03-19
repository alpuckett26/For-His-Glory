import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach out to the For His Glory team. We typically respond within 24–48 hours.',
}

const faqItems = [
  {
    question: 'What is your return/exchange policy?',
    answer: 'We accept returns and exchanges within 30 days of delivery. Items must be unworn, unwashed, and in original condition. Contact us to initiate a return.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5–10 business days. Expedited options are available at checkout. All orders are print-on-demand and fulfill within 2–4 business days before shipping.',
  },
  {
    question: 'Do you offer bulk/wholesale pricing?',
    answer: 'Yes! We love outfitting churches, ministries, and events. Visit our Bulk Orders page to submit an inquiry for custom volume pricing.',
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes. Once your order ships, you'll receive a tracking number by email. You can also view your order status in your account dashboard.',
  },
  {
    question: 'What sizes do you carry?',
    answer: 'We carry sizes XS through 3XL (availability varies by product). All measurements are listed on individual product pages.',
  },
]

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-warm-gray py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
            We'd Love to Hear From You
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-3">
            Get in Touch
          </h1>
          <p className="font-body text-base text-charcoal/60 leading-relaxed">
            Questions, feedback, partnership opportunities, or just want to share how our apparel has impacted your life — our inbox is always open.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl text-charcoal mb-6">Contact Info</h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm font-medium text-charcoal mb-0.5">Email</p>
                  <a
                    href="mailto:hello@forhisglory.com"
                    className="font-body text-sm text-charcoal/60 hover:text-gold transition-colors"
                  >
                    hello@forhisglory.com
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm font-medium text-charcoal mb-0.5">Response Time</p>
                  <p className="font-body text-sm text-charcoal/60">24–48 hours</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-10">
              <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-charcoal/40 mb-4">
                Common Requests
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Track my order', href: '/account/orders' },
                  { label: 'Bulk orders quote', href: '/bulk-orders' },
                  { label: 'Return/exchange', href: '/contact' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block font-body text-sm text-charcoal/60 hover:text-gold transition-colors"
                  >
                    → {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-charcoal mb-6">Send a Message</h2>
            <ContactForm />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 border-t border-warm-gray pt-16">
          <div className="text-center mb-10">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
              Quick Answers
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item) => (
              <div key={item.question} className="border-b border-warm-gray pb-6">
                <h3 className="font-body text-base font-semibold text-charcoal mb-2">
                  {item.question}
                </h3>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
