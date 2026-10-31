import Image from 'next/image';
import Link from 'next/link';
import { ContentPage } from '@/components/content-page';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About' };

const highlights = [
  {
    icon: '🎓',
    title: 'Education',
    description: 'B.Tech CSE · Elitte College of Engineering',
  },
  {
    icon: '💻',
    title: 'Technical Focus',
    description: 'Programming · Web Development · Full-Stack Engineering',
  },
  {
    icon: '👨‍🏫',
    title: 'Leadership & Mentoring',
    description: 'College Coding Club · President & C Programming Mentor',
  },
  {
    icon: '🏛️',
    title: 'Student Leadership',
    description: 'College Council · Vice President',
  },
  {
    icon: '🎵',
    title: 'Creative Side',
    description:
      'Singer · Guitarist · Tabla Player · Cultural Drama Productions',
  },
];

export default async function AboutPage() {
  const p = await prisma.profile.findFirst();

  return (
    <ContentPage
      index="01"
      title={p?.fullName ?? 'A student of software, systems, and creative work.'}
      intro={p?.headline ?? 'Building my foundation in software engineering.'}
    >
      <article className="card">
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="relative w-full max-w-[260px] aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-xl">
              <Image
                src="/preet-profile.jpg"
                alt="Preet Majumdar"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 260px"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-8">
            <section>
              <p className="text-xs uppercase tracking-[0.22em] muted mb-3">
                About Me
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Building skills. Creating solutions.
              </h2>

              <p className="text-sm md:text-base muted mb-5">
                Computer Science & Engineering Student
              </p>

              <p className="leading-8">
                I&apos;m an aspiring software developer focused on strengthening
                my programming fundamentals, exploring web technologies, and
                building practical applications. Alongside my technical
                journey, I teach C programming through my college Coding Club,
                serve as Vice President of the College Council, and actively
                participate in cultural activities.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-4">At a Glance</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 p-4 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span aria-hidden="true">{item.icon}</span>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                    </div>

                    <p className="text-sm muted leading-6">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h3 className="font-semibold text-lg mb-3">
                Academic Background
              </h3>

              <p className="leading-7">
                {p?.degree ?? 'B.Tech in Computer Science and Engineering'}
                {' · '}
                {p?.college ?? 'Elitte College of Engineering'}
              </p>

              <p className="muted text-sm mt-2">
                {p?.academicStatus ??
                  'Third-year undergraduate student, fifth semester'}
                {p?.expectedGraduation
                  ? ` · Expected graduation: ${p.expectedGraduation}`
                  : ''}
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">
                Current Technical Focus
              </h3>
              <p className="muted leading-7">
                Developing strong programming fundamentals, improving my
                web development skills, learning full-stack engineering, and
                creating useful software applications. I believe in
                continuous learning and presenting my abilities honestly.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">
                Beyond Technology
              </h3>
              <p className="muted leading-7">
                Music is an important part of my life. I sing, practise guitar
                and play tabla, while contributing to college cultural
                productions. I enjoy bringing creativity and discipline into
                everything I do.
              </p>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium border border-white/20 hover:bg-white/10 transition-colors"
              >
                Explore My Projects →
              </Link>

              <Link
                href="/contact"
                className="!inline-flex !items-center !justify-center !rounded-full !bg-slate-950 !text-cyan-300 !border !border-cyan-400 px-6 py-3 text-sm font-semibold hover:!bg-slate-800 hover:!text-white transition-colors"
              >
                Contact Me →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </ContentPage>
  );
}