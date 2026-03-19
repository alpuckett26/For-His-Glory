import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'For His Glory | Christian Apparel',
    template: '%s | For His Glory',
  },
  description:
    'Premium Christian apparel designed to inspire faith, purpose, and peace in everyday life. Deo Gloria — For His Glory, Worn Daily.',
  keywords: ['Christian apparel', 'faith clothing', 'Christian t-shirts', 'faith-based fashion'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'For His Glory',
    title: 'For His Glory | Christian Apparel',
    description:
      'Premium Christian apparel designed to inspire faith, purpose, and peace in everyday life.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For His Glory | Christian Apparel',
    description:
      'Premium Christian apparel designed to inspire faith, purpose, and peace in everyday life.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${dmSans.variable}`}>
      <body className="bg-ivory text-charcoal font-body antialiased">
        <Navbar />
        <main className="min-h-screen pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </body>
    </html>
  )
}
