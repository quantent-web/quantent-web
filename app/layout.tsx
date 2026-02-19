import type { Metadata } from 'next';
import { Spline_Sans_Mono, Poppins } from 'next/font/google';
import './globals.css';

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-mono', // mantenemos el nombre para no tocar globals.css
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'QuantEnt',
    template: '%s | QuantEnt',
  },
  description:
    'Quantitative models and mathematics for entitlement and data governance.',
  openGraph: {
    title: 'QuantEnt',
    description:
      'Quantitative models and mathematics for entitlement and data governance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantEnt',
    description:
      'Quantitative models and mathematics for entitlement and data governance.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${splineSansMono.variable} ${poppins.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
