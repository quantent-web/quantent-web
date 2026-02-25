import type { Metadata } from 'next';
import HomePageClient from './home-page-client';

export const metadata: Metadata = {
  title: 'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
  description:
    'QuantEnt delivers enterprise-grade entitlement management and quantitative data governance software with expert services for large, regulated organizations.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
    type: 'website',
    url: 'https://quant-ent.com',
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantEnt | Enterprise Entitlement Management & Data Governance Platform',
    description:
      'Enterprise-grade entitlement management and quantitative data governance for large, regulated organizations.',
    images: ['/twitter-image.png'],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
