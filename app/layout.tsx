import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Devanagari Converter — Krutidev ↔ Unicode',
  description: 'Forensically accurate Krutidev 010 ↔ Unicode Devanagari batch converter with archive support.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
