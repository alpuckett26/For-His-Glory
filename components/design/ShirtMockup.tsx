'use client'

// Determines if a hex color is dark (for blend mode switching)
function isDark(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

interface ShirtMockupProps {
  color: string         // hex color
  designUrl?: string | null
  mockupUrl?: string | null  // Printful photorealistic mockup — shown when available
  size?: number         // width in px, height is auto
}

export function ShirtMockup({ color, designUrl, mockupUrl, size = 400 }: ShirtMockupProps) {
  // Show Printful photorealistic mockup when available
  if (mockupUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mockupUrl}
        alt="Shirt mockup"
        width={size}
        style={{ display: 'block', height: 'auto' }}
      />
    )
  }

  const dark = isDark(color)
  // blend-multiply removes white bg on light shirts
  // blend-screen removes black bg on dark shirts (inverts design colors on dark)
  const blendMode = dark ? 'screen' : 'multiply'

  // Viewbox: 240 wide x 280 tall
  // T-shirt silhouette path (normalized to this viewbox)
  const shirtPath = `
    M 95,18
    C 88,18 82,20 78,25
    L 20,52
    L 8,88
    L 48,100
    L 48,262
    L 192,262
    L 192,100
    L 232,88
    L 220,52
    L 162,25
    C 158,20 152,18 145,18
    C 142,30 128,38 120,38
    C 112,38 98,30 95,18
    Z
  `

  // Chest print area: centered, roughly where a chest graphic would sit
  const printX = 72
  const printY = 105
  const printW = 96
  const printH = 96

  return (
    <svg
      viewBox="0 0 240 280"
      width={size}
      height={size * (280 / 240)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Shadow filter for shirt depth */}
        <filter id="shirt-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        {/* Clip path for chest print area */}
        <clipPath id="chest-clip">
          <rect x={printX} y={printY} width={printW} height={printH} />
        </clipPath>
      </defs>

      {/* Shirt body */}
      <path
        d={shirtPath}
        fill={color}
        filter="url(#shirt-shadow)"
        stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
        strokeWidth="1"
      />

      {/* Subtle fabric shading overlay */}
      <path
        d={shirtPath}
        fill="url(#fabric-shading)"
        opacity="0.12"
      />
      <defs>
        <linearGradient id="fabric-shading" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
      </defs>

      {/* Design image on chest */}
      {designUrl && (
        <image
          href={designUrl}
          x={printX}
          y={printY}
          width={printW}
          height={printH}
          clipPath="url(#chest-clip)"
          style={{ mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] }}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Placeholder crosshair when no design */}
      {!designUrl && (
        <g opacity="0.2">
          <rect
            x={printX}
            y={printY}
            width={printW}
            height={printH}
            fill="none"
            stroke={dark ? 'white' : 'black'}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <line
            x1={printX + printW / 2}
            y1={printY + 8}
            x2={printX + printW / 2}
            y2={printY + printH - 8}
            stroke={dark ? 'white' : 'black'}
            strokeWidth="1"
          />
          <line
            x1={printX + 8}
            y1={printY + printH / 2}
            x2={printX + printW - 8}
            y2={printY + printH / 2}
            stroke={dark ? 'white' : 'black'}
            strokeWidth="1"
          />
        </g>
      )}
    </svg>
  )
}
