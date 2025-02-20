import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata: Metadata = {
  title: "KzBarry's Base Project",
  description: 'This is a web app template from KzBarry to you with love.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
        />
      </head>
      <body>
        <UserProvider>
          <div className="container">
            {children}
            <Analytics />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
