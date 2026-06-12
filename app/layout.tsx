import type {Metadata} from 'next';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/jetbrains-mono/400.css';
import './globals.css'; // Global styles

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
