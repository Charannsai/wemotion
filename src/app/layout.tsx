import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
