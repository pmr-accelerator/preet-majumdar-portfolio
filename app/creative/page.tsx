
import Link from 'next/link';
import { ContentPage } from '@/components/content-page';

export const metadata = {
  title: 'Beyond Code',
};

const creativeSections = [
  {
    name: 'Singing',
    href: '/creative/singing',
    desc: 'A journal for original recordings and performances.',
  },
  {
    name: 'Guitar',
    href: '/creative/guitar',
    desc: 'Practice notes and recordings from an ongoing learning journey.',
  },
  {
    name: 'Tabla',
    href: '/creative/tabla',
    desc: 'Rhythm, practice, and performances with accurate taal details.',
  },
  {
    name: 'Drama',
    href: '/creative/drama',
    desc: 'College cultural productions and direction credits.',
  },
];

export default function CreativePage() {
  return (
    <ContentPage
      index="05"
      title="Beyond code."
      intro="Music and cultural productions are a meaningful part of how I learn, practise, and collaborate. This section will contain genuine recordings and production details only."
    >
      <div className="creative-grid">
        {creativeSections.map(({ name, href, desc }) => (
          <Link href={href} key={href} className="card">
            <p className="eyebrow mono">CREATIVE PRACTICE</p>
            <h2>{name} ↗</h2>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>

      <style>{`
        .creative-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .creative-grid h2 {
          margin: 16px 0 8px;
        }

        @media (max-width: 600px) {
          .creative-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ContentPage>
  );
}
