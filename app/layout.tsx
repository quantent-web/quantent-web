import type { Metadata } from 'next';
import { Spline_Sans_Mono, Poppins } from 'next/font/google';
import './globals.css';
import AuroraBackground from '@/components/backgrounds/AuroraBackground';

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved ? saved : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body className={`${splineSansMono.variable} ${poppins.variable}`}>
        <AuroraBackground />
        <div className="qe-aurora-content">{children}</div>
      </body>
    </html>
  );
}
