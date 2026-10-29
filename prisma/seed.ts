
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create the profile only if it does not already exist.
  if ((await prisma.profile.count()) === 0) {
    await prisma.profile.create({
      data: {
        fullName: 'Preet Majumdar',
        headline: 'Building my foundation in software engineering.',
        biography:
          "I'm a Computer Science and Engineering student developing my skills in programming and software development. Alongside my technical journey, I teach C programming through my college Coding Club and contribute to college cultural productions.",
        college: 'Elitte College of Engineering',
        degree: 'B.Tech in Computer Science and Engineering',
        academicStatus: 'Third-year undergraduate student, fifth semester',
      },
    });
  }

  // Add beginner skills without creating duplicates.
  const skills = [
    ['C', 'Programming', 'Basic', 'Learning programming fundamentals.'],
    [
      'HTML',
      'Web development',
      'Basic',
      'Building the structure of web pages.',
    ],
    [
      'CSS',
      'Web development',
      'Basic',
      'Learning layout, styling, and responsive design.',
    ],
    [
      'JavaScript',
      'Programming',
      'Basic',
      'Learning programming and browser fundamentals.',
    ],
  ] as const;

  for (let i = 0; i < skills.length; i++) {
    const [name, category, level, explanation] = skills[i];

    if (!(await prisma.skill.findFirst({ where: { name } }))) {
      await prisma.skill.create({
        data: {
          name,
          category,
          level,
          explanation,
          sortOrder: i,
          visible: true,
        },
      });
    }
  }

  // Add Coding Club experience if it does not already exist.
  if (
    !(await prisma.experience.findFirst({
      where: { title: 'President, Coding Club' },
    }))
  ) {
    await prisma.experience.create({
      data: {
        title: 'President, Coding Club',
        organization: 'Elitte College of Engineering',
        current: true,
        responsibilities: [
          'Teaching C programming',
          'Supporting junior students with programming fundamentals',
          'Participating in coding education and club activities',
        ],
        teachingSubjects: ['C programming'],
        description:
          'Student leadership and programming education. Exact start date has not been configured.',
        status: 'PUBLISHED',
        sortOrder: 0,
      },
    });
  }

  // Add cultural production experience if it does not already exist.
  if (
    !(await prisma.experience.findFirst({
      where: { title: 'Director — College Cultural Productions' },
    }))
  ) {
    await prisma.experience.create({
      data: {
        title: 'Director — College Cultural Productions',
        organization:
          'Elitte College of Engineering · Cultural Department',
        current: false,
        responsibilities: ['Directed two college drama productions'],
        teachingSubjects: [],
        description:
          "Directed two college drama productions through the college's cultural department. Individual production details can be added when confirmed.",
        status: 'PUBLISHED',
        sortOrder: 1,
      },
    });
  }

  // Create or update the achievement.
  await prisma.achievement.upsert({
    where: {
      slug: 'second-position-poster-presentation-iiest-shibpur',
    },
    update: {},
    create: {
      title: 'Second Position — Poster Presentation',
      slug: 'second-position-poster-presentation-iiest-shibpur',
      category: 'Technical presentation',
      organization: 'IIEST Shibpur',
      issueDate: new Date('2025-09-12T00:00:00.000Z'),
      description:
        'Secured second position in a poster presentation on AI/ML in Rock & Coal Property Classifications. Supporting certificate or event photograph has not yet been supplied.',
      subjectArea: 'AI/ML in Rock & Coal Property Classifications',
      publicationStatus: 'PUBLISHED',
      sortOrder: 0,
      publishedAt: new Date('2025-09-12T00:00:00.000Z'),

      // FIX: This required String[] field must not be omitted.
      supportingMediaIds: [],
    },
  });

  // Create site settings only if they do not already exist.
  if ((await prisma.siteSettings.count()) === 0) {
    await prisma.siteSettings.create({
      data: {
        siteTitle: 'Preet / Digital Field Notes',
        siteDescription:
          'Software development, technical learning, leadership, and creative work.',
      },
    });
  }

  console.log('Portfolio seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Portfolio seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
