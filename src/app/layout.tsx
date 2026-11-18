import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'KZ Barry',
  description:
    'Next.js + Supabase + Sentry + Vercel starter, ready for agent-driven development.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-10">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
