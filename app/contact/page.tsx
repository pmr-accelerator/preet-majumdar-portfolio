
import { ContentPage } from '@/components/content-page';
import { submitContactAction } from './actions';
import { prisma } from '@/lib/prisma';
import {
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
} from 'lucide-react';

export const metadata = {
  title: 'Contact',
};

function getSocialIcon(label: string) {
  const name = label.toLowerCase();

  if (name.includes('linkedin')) return Linkedin;
  if (name.includes('github')) return Github;
  if (name.includes('instagram')) return Instagram;

  return ExternalLink;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  const links = await prisma.socialLink.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
    take: 8,
  });

  return (
    <ContentPage
      index="06"
      title="Let&apos;s start a conversation."
      intro="For software development opportunities, internships, technical discussions, or relevant collaboration, send a message using this form."
    >
      <div className="card">
        <p className="eyebrow mono">CONTACT / PRIVATE MESSAGE</p>

        {sent === 'ok' ? (
          <div role="status">
            <h2>Message saved.</h2>
            <p className="muted">
              Your message has been recorded. Email notification is
              attempted only when the owner has configured the email
              service; saving a message does not guarantee email delivery.
            </p>
            <a className="button" href="/contact">
              Send another message
            </a>
          </div>
        ) : sent === 'limited' ? (
          <p role="alert">
            Too many attempts. Please wait before sending another message.
          </p>
        ) : sent === 'invalid' ? (
          <p role="alert">
            Please check the form fields and try again.
          </p>
        ) : null}

        <form action={submitContactAction} className="admin-form">
          <label>
            Full name
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>

          <label>
            Subject
            <input
              name="subject"
              required
              minLength={3}
              maxLength={160}
            />
          </label>

          <label>
            Inquiry type
            <select name="category" defaultValue="Other">
              <option>Job Opportunity</option>
              <option>Internship</option>
              <option>Collaboration</option>
              <option>Technical Discussion</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Message
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={6}
            />
          </label>

          <div className="honeypot" aria-hidden="true">
            <label>
              Leave blank
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <button className="button button-primary" type="submit">
            Send message
          </button>

          <p
            className="muted"
            style={{ fontSize: '.85rem' }}
          >
            Your message is stored privately for the portfolio owner.
            Please do not include passwords or sensitive personal
            information. See the <a href="/privacy">privacy notice</a>.
          </p>
        </form>
      </div>

      {links.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <p className="eyebrow mono">SOCIAL / PROFESSIONAL PROFILES</p>

          <h2 style={{ marginBottom: 10 }}> Connect.</h2>

          <p className="muted" style={{ marginBottom: 24 }}>
            I&apos;m open to professional networking, technical discussions,
            collaboration and creative opportunities.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: 14,
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
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: 20,
                  }}
                >
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    color="var(--accent)"
                  />

                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {link.label}
                  </span>

                  <ExternalLink
                    size={15}
                    color="var(--muted)"
                  />
                </a>
              );
            })}
          </div>
        </section>
      )}
    </ContentPage>
  );
}
