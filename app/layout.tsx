import type { Metadata } from 'next';
import { Spline_Sans_Mono, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-mono',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quant-ent.com'),

  title:
    'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',

  description:
    'QuantEnt delivers enterprise-grade entitlement management and quantitative data governance software with expert services for large, regulated organizations.',

  openGraph: {
    title:
      'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
    type: 'website',
    url: 'https://quant-ent.com',
  },

  twitter: {
    card: 'summary_large_image',
    title:
      'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
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
        <Analytics />
      </body>
    </html>
  );
}
