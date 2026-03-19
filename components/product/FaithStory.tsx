interface FaithStoryProps {
  brandMessage: string
  longDescription?: string | null
}

export function FaithStory({ brandMessage, longDescription }: FaithStoryProps) {
  return (
    <div className="border-t border-warm-gray pt-8 mt-8">
      {/* Pull quote */}
      <div className="relative pl-8 mb-8">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" />
        <blockquote className="font-display text-2xl sm:text-3xl text-charcoal italic leading-tight">
          "{brandMessage}"
        </blockquote>
        <p className="font-body text-xs text-charcoal/40 mt-3 uppercase tracking-widest">
          — For His Glory
        </p>
      </div>

      {/* Long description */}
      {longDescription && (
        <div className="prose prose-sm max-w-none">
          <p className="font-body text-sm text-charcoal/70 leading-relaxed">
            {longDescription}
          </p>
        </div>
      )}

      {/* Care & Details */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {[
          { label: 'Material', value: '100% Ring-Spun Cotton' },
          { label: 'Fit', value: 'Relaxed / Oversized' },
          { label: 'Print', value: 'Premium Screen Print' },
          { label: 'Care', value: 'Machine wash cold, tumble dry low' },
        ].map((detail) => (
          <div key={detail.label}>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-1">
              {detail.label}
            </p>
            <p className="font-body text-sm text-charcoal">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
