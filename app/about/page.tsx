import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind For His Glory — premium Christian apparel rooted in faith, purpose, and excellence.',
}

const pillars = [
  {
    icon: '✦',
    title: 'Faith',
    description: 'Every piece begins with a truth from scripture. We start with the Word and work backwards to the design.',
  },
  {
    icon: '✦',
    title: 'Purpose',
    description: 'You were made on purpose, for a purpose. Our apparel is a daily reminder of the calling placed on your life.',
  },
  {
    icon: '✦',
    title: 'Community',
    description: 'Faith is personal, but it was never meant to be private. Our garments invite conversation, connection, and encouragement.',
  },
  {
    icon: '✦',
    title: 'Excellence',
    description: 'We believe God deserves our best. That means premium materials, thoughtful design, and clothing built to last.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-charcoal py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">
            Our Story
          </p>
          <h1 className="font-display text-5xl sm:text-7xl text-ivory leading-[1.05] mb-6">
            Made for More Than a Moment
          </h1>
          <p className="font-body text-base text-ivory/60 max-w-2xl mx-auto leading-relaxed">
            Deo Gloria — For His Glory, Worn Daily. We're not just making clothes. We're creating declarations.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 font-body text-base text-charcoal/80 leading-relaxed">
            <p>
              We started For His Glory because we believed fashion and faith didn't have to be strangers. For too long, Christian apparel looked like an afterthought — clipart crosses, Comic Sans, and designs that seemed almost apologetic about what they were trying to say.
            </p>
            <p>
              We wanted something different. Something that could sit next to any premium streetwear brand and not flinch. Something that said "I follow Jesus" not with cringe, but with confidence. Something you could wear to a coffee shop, a concert, or a prayer meeting — and feel proud in all three.
            </p>
            <p>
              The name came from a single conviction: everything we do should be an offering. Not just our Sunday mornings, not just our tithing — but our creativity, our style, our everyday choices. "For His Glory" is a posture, not just a brand name.
            </p>
            <p>
              So we sourced premium blanks. We worked with artists who understood the balance between faith and aesthetics. We wrote brand messages that felt more like devotionals than marketing copy. We built a brand that treats your faith with the seriousness it deserves — and the excellence it warrants.
            </p>
            <p className="font-display text-2xl text-charcoal">
              This is apparel rooted in grace, worn with purpose. Welcome to For His Glory.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">
              What We Stand For
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-charcoal">
              Our Four Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold text-lg">{pillar.icon}</span>
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-3">{pillar.title}</h3>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-gray">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-[1px] h-16 bg-gold mx-auto mb-8" />
          <blockquote className="font-display text-3xl sm:text-4xl text-charcoal leading-tight mb-6">
            "Whatever you do, work at it with all your heart, as working for the Lord."
          </blockquote>
          <p className="font-body text-sm text-charcoal/50 uppercase tracking-widest">
            Colossians 3:23
          </p>
        </div>
      </section>
    </div>
  )
}
