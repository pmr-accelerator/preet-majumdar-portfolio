
import Image from 'next/image';
import { ContentPage } from '@/components/content-page';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About' };

export default async function AboutPage() {
  const p = await prisma.profile.findFirst();

  return (
    <ContentPage
      index="01"
      title={p?.fullName ?? 'A student of software, systems, and creative work.'}
      intro={p?.headline ?? 'Building my foundation in software engineering.'}
    >
      <article className="card">

        {/* Profile Photograph */}
        <div className="mb-8 flex justify-center md:justify-start">
          <div className="relative w-full max-w-[280px] aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <Image
              src="/preet-profile.jpg"
              alt="Preet Majumdar"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 280px"
              className="object-cover object-center"
            />
          </div>
        </div>

        <p style={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
          {p?.biography ?? "I'm a Computer Science and Engineering student developing my skills in programming and software development. Alongside my technical journey, I teach C programming through my college Coding Club and contribute to college cultural productions."}
        </p>

        <h2>Education</h2>
        <p>
          {p?.degree ?? 'B.Tech in Computer Science and Engineering'} · {p?.college ?? 'Elitte College of Engineering'}
        </p>

        <p className="muted">
          {p?.academicStatus ?? 'Third-year undergraduate student, fifth semester'}
          {p?.expectedGraduation ? ` · Expected graduation: ${p.expectedGraduation}` : ''}
        </p>

        <h2>Current focus</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          Programming fundamentals, web development, full-stack engineering, and building practical applications. My current skills are presented honestly as learning and developing capabilities.
        </p>

        <h2>Beyond code</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          I also sing, practise guitar and tabla, and contribute to college cultural productions. These activities complement my technical journey rather than replace it.
        </p>

      </article>
    </ContentPage>
  );
}
