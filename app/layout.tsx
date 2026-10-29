import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PortfolioAssistant } from '@/components/portfolio-assistant';

export const metadata: Metadata = {
  title: { default: 'Preet Majumdar — Digital Field Notes', template: '%s | Preet Majumdar' },
  description: 'Software development, technical learning, leadership, and creative work by Preet Majumdar.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader /><main>{children}</main><SiteFooter /><PortfolioAssistant /></body></html>;
}
