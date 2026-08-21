import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'WeMotion — AI-Powered Motion Design for SaaS',
  description:
    'Create stunning product videos from your website. WeMotion is an AI-native professional motion-design editor purpose-built for SaaS product videos.',
  keywords: ['motion design', 'SaaS', 'product video', 'AI video editor', 'WeMotion'],
  authors: [{ name: 'WeMotion' }],
  robots: 'index, follow',
  openGraph: {
    title: 'WeMotion — AI-Powered Motion Design for SaaS',
    description: 'Create stunning product videos from your website.',
    type: 'website',
    siteName: 'WeMotion',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
