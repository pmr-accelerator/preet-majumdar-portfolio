
import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PortfolioAssistant } from '@/components/portfolio-assistant';
import { IntroSplash } from '@/components/intro-splash';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Preet Majumdar',
  url: 'https://preet-majumdar-portfolio.onrender.com',
  jobTitle: 'Computer Science and Engineering Student',
  description:
    'Computer Science and Engineering student interested in software development, web development, technology, leadership, and creative work.',
  knowsAbout: [
    'Computer Science',
    'Software Development',
    'Web Development',
    'JavaScript',
    'React',
    'Next.js',
    'Programming',
  ],
  sameAs: [
    'https://github.com/pmr-accelerator',
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://preet-majumdar-portfolio.onrender.com'
  ),

  title: {
    default: 'Preet Majumdar | CSE Student & Aspiring Web Developer',
    template: '%s | Preet Majumdar',
  },

  description:
    'Explore the portfolio of Preet Majumdar, a Computer Science and Engineering student interested in web development, software engineering, technology, leadership, and innovative projects.',

  verification: {
    google: 'BJqjBFkdQQKVkrm9-JVCy5z2tnHrwuQQAfw2KY9-Cj8',
  },

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: 'Preet Majumdar | CSE Student & Aspiring Web Developer',
    description:
      'Explore Preet Majumdar’s portfolio, technical projects, skills, leadership, and creative work.',
    url: 'https://preet-majumdar-portfolio.onrender.com',
    siteName: 'Preet Majumdar Portfolio',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
          }}
        />

        <IntroSplash />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <PortfolioAssistant />
      </body>
    </html>
  );
}
