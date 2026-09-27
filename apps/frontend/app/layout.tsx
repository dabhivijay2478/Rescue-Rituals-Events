import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rescue Rituals',
  description: 'Browse events and RSVP',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
