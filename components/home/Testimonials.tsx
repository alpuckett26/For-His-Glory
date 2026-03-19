import { SectionHeading } from '@/components/shared/SectionHeading'

const testimonials = [
  {
    id: 1,
    quote: "I wore the Faith Over Fear tee to my chemo appointment. Three nurses asked where I got it. Now they all have one. This isn't just a shirt.",
    name: 'Denise M.',
    location: 'Atlanta, GA',
    rating: 5,
  },
  {
    id: 2,
    quote: "Finally, Christian apparel that doesn't look like it came from a Sunday school supply store. These are legitimate, beautiful pieces I'm proud to wear.",
    name: 'Marcus T.',
    location: 'Houston, TX',
    rating: 5,
  },
  {
    id: 3,
    quote: "The quality is incredible. I've washed the Pray First tee a dozen times and it still looks brand new. Worth every penny and then some.",
    name: 'Rachel J.',
    location: 'Nashville, TN',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="What They're Saying"
          title="Worn. Shared. Witnessed."
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 border border-warm-gray relative"
            >
              {/* Gold accent */}
              <div className="w-8 h-[2px] bg-gold mb-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="font-body text-charcoal/80 text-sm leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              <div>
                <p className="font-body font-semibold text-sm text-charcoal">
                  {testimonial.name}
                </p>
                <p className="font-body text-xs text-charcoal/50">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
