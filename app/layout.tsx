import type { Metadata } from 'next';
import { Spline_Sans_Mono, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
  alternates: {
    canonical: '/',
  },

  title:
    'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',

  description:
    'QuantEnt delivers enterprise-grade entitlement management and quantitative data governance software with expert services for large, regulated organizations.',
  keywords: [
    'enterprise IAM',
    'entitlement management',
    'data governance',
    'identity governance administration',
    'audit compliance',
    'least privilege access',
    'regulated industries security',
  ],

  openGraph: {
    title:
      'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
    type: 'website',
    url: 'https://quant-ent.com',
    images: ['/opengraph-image.png'],
  },

  twitter: {
    card: 'summary_large_image',
    title:
      'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://quant-ent.com/#organization',
        name: 'QuantEnt',
        url: 'https://quant-ent.com',
        sameAs: ['https://www.linkedin.com/company/quantent-technologies'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://quant-ent.com/#website',
        url: 'https://quant-ent.com',
        name: 'QuantEnt',
        publisher: {
          '@id': 'https://quant-ent.com/#organization',
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body className={`${splineSansMono.variable} ${poppins.variable}`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <main id="main-content">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
