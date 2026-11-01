import { ContentPage } from '@/components/content-page';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Experience & Leadership'
};

export default async function ExperiencePage() {
  const entries = await prisma.experience.findMany({
    where: {
      status: 'PUBLISHED'
    },
    orderBy: [
      { featured: 'desc' },
      { sortOrder: 'asc' },
      { startDate: 'desc' }
    ]
  });

  return (
    <ContentPage
      index="02"
      title="Learning, teaching, contributing."
      intro="My experience so far is grounded in student leadership, programming education, and college cultural productions."
    >
      {entries.length === 0 ? (
        <div className="card experience-empty">
          <h2>Experience details will be added here.</h2>
          <p className="muted">
            Leadership, mentoring and professional activities will appear here.
          </p>
        </div>
      ) : (
        <div className="experience-grid">
          {entries.map(entry => (
            <article
              className={`experience-card${entry.featured ? ' experience-card-featured' : ''}`}
              key={entry.id}
            >
              <div className="experience-card-top">
                <p className="experience-organization mono">
                  {entry.organization}
                </p>

                {entry.current && (
                  <span className="experience-status">
                    <span className="experience-status-dot" />
                    PRESENT
                  </span>
                )}
              </div>

              <h2>{entry.title}</h2>

              {(entry.startDate || entry.endDate || entry.current) && (
                <p className="experience-date">
                  {entry.startDate
                    ? entry.startDate.toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric'
                      })
                    : ''}
                  {entry.current
                    ? ' — Present'
                    : entry.endDate
                      ? ` — ${entry.endDate.toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric'
                        })}`
                      : ''}
                </p>
              )}

              {entry.description && (
                <p className="experience-description">
                  {entry.description}
                </p>
              )}

              {entry.responsibilities.length > 0 && (
                <ul className="experience-responsibilities">
                  {entry.responsibilities.map((responsibility, index) => (
                    <li key={`${entry.id}-${index}`}>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              )}

              {entry.teachingSubjects.length > 0 && (
                <p className="experience-teaching mono">
                  Teaching: {entry.teachingSubjects.join(' · ')}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </ContentPage>
  );
}