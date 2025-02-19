import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata: Metadata = {
  title: "KzBarry' Base Project",
  description: 'This is a web app template from KzBarry to you with love.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <UserProvider>
          {children}
          <Analytics />
        </UserProvider>
      </body>
    </html>
  );
}
