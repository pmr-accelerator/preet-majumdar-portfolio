
import Link from 'next/link';
import {
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

function getSocialIcon(label: string) {
  const name = label.toLowerCase();

  if (name.includes('linkedin')) return Linkedin;
  if (name.includes('github')) return Github;
  if (name.includes('instagram')) return Instagram;

  return ExternalLink;
}

export async function SiteFooter() {
  const links = await prisma.socialLink.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
    take: 8,
  });

  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        paddingBlock: 28,
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          color: 'var(--muted)',
          fontSize: '.84rem',
        }}
      >
        <span>© {new Date().getFullYear()} Preet Majumdar</span>

        <span>Learning in public. Building with intent.</span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {links.map((link) => {
            const Icon = getSocialIcon(link.label);

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${link.label}`}
                title={link.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'color .2s ease',
                }}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{link.label}</span>
              </a>
            );
          })}

          <Link href="/gallery">Gallery</Link>
          <Link href="/privacy">Privacy</Link>
          <Link
  href="/reviews#submit-review"
  className="button button-primary"
>
  Write a Review
</Link>
        </div>
      </div>
    </footer>
  );
}
