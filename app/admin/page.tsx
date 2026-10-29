import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { logoutAction } from './actions';
export const metadata = { title: 'Admin dashboard', robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [projects, achievements, gallery, creative, drafts, unread] = await Promise.all([
    prisma.project.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.achievement.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.galleryItem.count({ where: { publicationStatus: 'PUBLISHED' } }),
    prisma.creativeEntry.count({ where: { publicationStatus: 'PUBLISHED' } }),
    Promise.all([prisma.project.count({ where: { publicationStatus: 'DRAFT' } }), prisma.achievement.count({ where: { publicationStatus: 'DRAFT' } }), prisma.creativeEntry.count({ where: { publicationStatus: 'DRAFT' } })]).then(values => values.reduce((a, b) => a + b, 0)),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
  ]);
  const stats = [['Published projects', projects], ['Achievements', achievements], ['Gallery items', gallery], ['Creative entries', creative], ['Drafts', drafts], ['Unread messages', unread]] as const;
  return <section className="wrap" style={{ paddingBlock: 48, minHeight: '70vh' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}><div><p className="eyebrow mono">PRIVATE / CONTENT MANAGEMENT</p><h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', letterSpacing: '-.06em', margin: '8px 0' }}>Good to see you, {admin.name}.</h1><p className="muted">These counts come from the database, not hardcoded display values.</p></div><form action={logoutAction}><button className="button" type="submit">Sign out</button></form></div>
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12, marginTop: 30 }}>{stats.map(([label, count])=><div className="card" key={label}><p className="muted" style={{ fontSize: '.85rem' }}>{label}</p><p style={{ fontSize: '2.3rem', margin: '12px 0 0', letterSpacing: '-.05em' }}>{count}</p></div>)}</div>
    <div className="card" style={{ marginTop: 20 }}><p className="eyebrow mono">CONTENT MANAGEMENT</p><h2>Manage your public portfolio</h2><p className="muted" style={{ lineHeight: 1.8 }}>Create and publish projects and achievements, review contact messages, and keep unpublished drafts private. Content changes update the public pages from the database.</p><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}><Link className="button button-primary" href="/admin/profile">Edit profile</Link><Link className="button" href="/admin/projects">Manage projects</Link><Link className="button" href="/admin/skills">Manage skills</Link><Link className="button" href="/admin/experience">Manage experience</Link><Link className="button" href="/admin/links">Professional links</Link><Link className="button" href="/admin/drama">Drama productions</Link><Link className="button" href="/admin/achievements">Manage achievements</Link><Link className="button" href="/admin/messages">Contact inbox</Link><Link className="button" href="/admin/media">Media library</Link><Link className="button" href="/admin/creative">Creative entries</Link><Link className="button" href="/admin/gallery">Photo gallery</Link><Link className="button" href="/admin/resume">Manage résumé</Link><Link className="button" href="/">View public site</Link></div></div>
  </section>;
}
