import type { Metadata } from 'next';
import { Space_Mono, Poppins } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-mono',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'QuantEnt',
  description:
    'Quantitative models and mathematics for entitlement and data governance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
