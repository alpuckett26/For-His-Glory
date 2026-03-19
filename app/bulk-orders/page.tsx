import type { Metadata } from 'next'
import { BulkInquiryForm } from '@/components/bulk/BulkInquiryForm'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bulk Orders',
  description: 'Custom bulk orders for churches, ministries, and events. Volume pricing, fast turnaround.',
}

const benefits = [
  'Volume discounts on orders of 12+ pieces',
  'Custom artwork and design support',
  'All sizes available, including youth',
  'Fast 2-week production timeline',
  'Dedicated order coordinator',
  'Free digital proof before production',
]

const faqItems = [
  {
    q: 'What is the minimum order quantity?',
    a: 'For custom bulk orders, our minimum is typically 12 pieces. For standard products, there is no minimum.',
  },
  {
    q: 'Can you use our church logo or custom artwork?',
    a: 'Absolutely. We support custom artwork, logos, and text additions to any of our base products. Upload your files in the form and our team will work with you on the design.',
  },
  {
    q: 'How long does a bulk order take?',
    a: 'Standard bulk orders take 10–14 business days after artwork approval. Expedited 5–7 day options are available for a rush fee.',
  },
  {
    q: 'Do you offer sizing for youth/children?',
    a: 'Yes! We carry youth sizes for most of our products. Let us know in your inquiry and we can include youth sizing in your quote.',
  },
  {
    q: 'What file formats do you accept for artwork?',
    a: 'We accept AI, EPS, PDF, and high-resolution PNG (300 dpi+) files. Our design team can also help vectorize existing artwork for a small fee.',
  },
]

export default function BulkOrdersPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-charcoal py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">
            Churches · Ministries · Events
          </p>
          <h1 className="font-display text-5xl sm:text-6xl text-ivory leading-tight mb-4">
            Outfit Your Church, Ministry, or Event
          </h1>
          <p className="font-body text-base text-ivory/60 max-w-xl mx-auto leading-relaxed">
            Custom bulk orders with volume pricing, personalized support, and the same premium quality your congregation deserves.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="font-display text-2xl text-charcoal mb-6">Why Bulk With Us</h2>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-charcoal/70">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="mt-10 p-5 bg-warm-gray border-l-4 border-gold">
              <blockquote className="font-body text-sm text-charcoal/80 italic leading-relaxed mb-3">
                "We ordered 200 shirts for our church conference. The process was seamless and the quality blew everyone away. We've ordered 3 times since."
              </blockquote>
              <p className="font-body text-xs font-semibold text-charcoal">
                Pastor David Williams, Cornerstone Church
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-charcoal mb-6">Request a Free Quote</h2>
            <BulkInquiryForm />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 border-t border-warm-gray pt-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal">
              Bulk Order FAQ
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item) => (
              <div key={item.q} className="border-b border-warm-gray pb-6">
                <h3 className="font-body text-base font-semibold text-charcoal mb-2">{item.q}</h3>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
