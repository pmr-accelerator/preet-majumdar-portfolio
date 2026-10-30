
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
    description: 'College Coding Club · C Programming Mentor',
  },
  {
    icon: '🎵',
    title: 'Creative Side',
    description: 'Singer · Guitarist · Tabla Player',
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
        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">

          {/* LEFT: Profile Photograph */}
          <div className="flex justify-center md:justify-start">
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

          {/* RIGHT: Professional Introduction */}
          <div className="min-w-0 flex flex-col gap-6">

            <div>
              <p className="text-sm uppercase tracking-[0.2em] muted mb-3">
                About Me
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                Building skills. Creating solutions.
              </h2>

              <p className="text-sm md:text-base muted mb-4">
                Computer Science & Engineering Student
              </p>

              <p className="leading-8">
                I&apos;m an aspiring software developer focused on strengthening
                my programming fundamentals, exploring web technologies, and
                building practical applications. Alongside my technical
                journey, I teach C programming through my college Coding Club
                and actively participate in cultural activities.
              </p>
            </div>

            {/* Quick Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 p-4 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span aria-hidden="true">{item.icon}</span>
                    <h3 className="font-semibold text-sm">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-sm muted leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Education Details */}
            <div className="border-t border-white/10 pt-5">
              <h3 className="font-semibold mb-2">Academic Background</h3>

              <p className="leading-7">
                {p?.degree ?? 'B.Tech in Computer Science and Engineering'}
                {' · '}
                {p?.college ?? 'Elitte College of Engineering'}
              </p>

              <p className="muted text-sm mt-1">
                {p?.academicStatus ?? 'Third-year undergraduate student, fifth semester'}
                {p?.expectedGraduation
                  ? ` · Expected graduation: ${p.expectedGraduation}`
                  : ''}
              </p>
            </div>

            {/* Current Focus */}
            <div>
              <h3 className="font-semibold mb-2">What I&apos;m Working Towards</h3>
              <p className="muted leading-7">
                Developing strong programming fundamentals, improving my
                web development skills, learning full-stack engineering, and
                creating useful software applications. I believe in
                continuous learning and presenting my abilities honestly.
              </p>
            </div>

            {/* Creative Interests */}
            <div>
              <h3 className="font-semibold mb-2">Beyond Technology</h3>
              <p className="muted leading-7">
                Music is an important part of my life. I sing, practise guitar
                and play tabla, while contributing to college cultural
                productions. I enjoy bringing creativity and discipline into
                everything I do.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium border border-white/20 hover:bg-white/10 transition-colors"
              >
                Explore My Projects →
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium bg-white text-black hover:bg-white/85 transition-colors"
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
