import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import LayoutWrapper from '@/components/shared/layout-wrapper';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Ask the CPA Guy',
  description: 'Get answers to your accounting and QuickBooks questions from a certified CPA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen bg-background text-foreground"
        style={{ backgroundColor: '#212121', color: '#ffffff' }}>
        <Header />

        {/* this client component will decide items-start vs items-center */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>

        <Footer />
      </body>
    </html>
  )
}
