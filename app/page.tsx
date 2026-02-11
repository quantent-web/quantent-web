import type { Metadata } from 'next';
import HomePageClient from './home-page-client';

export const metadata: Metadata = {
  title: 'Institutional entitlement and data governance',
  description:
    'QuantEnt helps organizations establish measurable control over entitlements and enterprise data governance.',
  openGraph: {
    title: 'Institutional entitlement and data governance',
    description:
      'QuantEnt helps organizations establish measurable control over entitlements and enterprise data governance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Institutional entitlement and data governance',
    description:
      'QuantEnt helps organizations establish measurable control over entitlements and enterprise data governance.',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
