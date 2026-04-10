
// src/app/layout.tsx
// This is now a Server Component to enable server-side rendering
import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import './globals.css';
import { ClientLayoutWrapper } from '@/components/layout/client-layout-wrapper';

const noto_sans = Noto_Sans({
  subsets: ['latin', 'devanagari', 'malayalam'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MediAssistant',
  description: 'AI-Powered Medical Assistant',
  manifest: '/manifest.json',
  applicationName: "MediAssistant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediAssistant",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#008080",
    "msapplication-tap-highlight": "no",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="hsl(180, 100%, 25%)" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="hsl(216, 65%, 11%)" media="(prefers-color-scheme: dark)" />
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js" async></script>
      </head>
      <body className={`${noto_sans.className} antialiased`}>
        {/* All client-side providers are now inside the wrapper */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
