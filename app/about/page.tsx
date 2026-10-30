
import Image from 'next/image';
import Link from 'next/link';
import { ContentPage } from '@/components/content-page';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About' };

const highlights = [
  {
    number: '01',
    title: 'Technical Development',
    description:
      'Building a strong foundation in programming, web development, and full-stack engineering.',
  },
  {
    number: '02',
    title: 'Leadership & Mentoring',
    description:
      'Serving as Vice President of the College Council and helping juniors learn C programming through the Coding Club.',
  },
  {
    number: '03',
    title: 'Projects & Innovation',
    description:
      'Exploring practical software solutions and developing projects that connect technology with real-world needs.',
  },
  {
    number: '04',
    title: 'Music & Creativity',
    description:
      'Exploring music through singing, guitar, and tabla, while contributing to college cultural productions.',
  },
];

export default async function AboutPage() {
  const p = await prisma.profile.findFirst();

  return (
    <ContentPage
      index="01"
      title={p?.fullName ?? 'About Me'}
      intro={p?.headline ?? 'Building skills. Creating solutions.'}
    >
      <div className="space-y-12">

        {/* Profile introduction */}
        <section className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8 md:gap-10 items-center">

          {/* Profile photograph */}
          <div className="relative mx-auto w-full max-w-[280px] aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <Image
              src="/preet-profile.jpg"
              alt="Preet Majumdar"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 280px"
              className="object-cover object-center"
            />
          </div>

          {/* Introduction */}
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] muted">
              Computer Science & Engineering Student
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold">
              Building my journey in technology, leadership, and creativity.
            </h2>

            <p className="muted leading-8 whitespace-pre-wrap">
              {p?.biography ??
                "I'm a Computer Science and Engineering student at Elitte College of Engineering, focused on developing my skills in programming and software development. I enjoy learning new technologies, building practical projects, and exploring how software can solve real-world problems."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="card">
                <p className="text-sm muted">Education</p>
                <p className="font-medium mt-1">
                  {p?.degree ?? 'B.Tech in Computer Science and Engineering'}
                </p>
                <p className="text-sm muted mt-1">
                  {p?.college ?? 'Elitte College of Engineering'}
                </p>
              </div>

              <div className="card">
                <p className="text-sm muted">Academic Status</p>
                <p className="font-medium mt-1">
                  {p?.academicStatus ?? 'Third-year undergraduate student'}
                </p>
                {p?.expectedGraduation && (
                  <p className="text-sm muted mt-1">
                    Expected graduation: {p.expectedGraduation}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/projects" className="button">
                Explore Projects
              </Link>
              <Link href="/contact" className="button">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section>
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] muted">
              What I Do
            </p>
            <h2 className="text-2xl font-semibold mt-2">
              Beyond the Classroom
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item) => (
              <div key={item.number} className="card">
                <p className="text-sm muted mb-3">{item.number}</p>
                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="muted leading-7">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Current direction */}
        <section className="card space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] muted">
            Current Direction
          </p>

          <h2 className="text-2xl font-semibold">
            Learning Today. Building for Tomorrow.
          </h2>

          <p className="muted leading-8">
            My current focus is on strengthening programming fundamentals,
            improving my web development skills, and gaining practical
            experience through software projects. I aim to grow into a
            capable software developer through consistent learning,
            experimentation, and problem-solving.
          </p>
        </section>

      </div>
    </ContentPage>
  );
}
