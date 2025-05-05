import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Ask the CPA Guy',
  description: 'Get answers to your accounting and QuickBooks questions from a certified CPA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}