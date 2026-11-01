import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Code2, GraduationCap, Mic2, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [profile, dbSkills, projects, achievements, resume, resumeMedia] = await Promise.all([prisma.profile.findFirst(), prisma.skill.findMany({ where: { visible: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 8 }), prisma.project.findMany({ where: { publicationStatus: 'PUBLISHED' }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }], take: 3 }), prisma.achievement.findMany({ where: { publicationStatus: 'PUBLISHED' }, orderBy: [{ featured: 'desc' }, { issueDate: 'desc' }], take: 1 }), prisma.resumeAsset.findFirst({ where: { published: true }, orderBy: { createdAt: 'desc' } }), prisma.mediaAsset.findMany({ where: { contentType: 'application/pdf' } })]);
  const resumeUrl = resume ? resumeMedia.find(asset => asset.id === resume.mediaAssetId)?.publicUrl : null;
  const skills = dbSkills.map(skill => `${skill.name} — ${skill.level}`);
  return <>
    <section className="wrap" style={{ paddingBlock: 'clamp(76px, 12vw, 150px) 100px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(240px, .65fr)', gap: 56, alignItems: 'center' }}>
      <div>
        <p className="eyebrow mono">PERSONAL PORTFOLIO / 2026</p>
        <h1 style={{ fontSize: 'clamp(3.3rem, 8vw, 7.1rem)', lineHeight: .94, letterSpacing: '-.075em', margin: '24px 0 26px', maxWidth: 850 }}>{profile?.headline ? profile.headline : <>Building my foundation in <span style={{ color: 'var(--accent)' }}>software engineering.</span></>}</h1>
        <p style={{ maxWidth: 630, color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.85 }}>{profile?.biography ?? 'I’m Preet Majumdar, a Computer Science and Engineering student developing my skills in programming and software development. Alongside my technical journey, I teach C programming through my college Coding Club and contribute to college cultural productions.'}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
          <Link className="button button-primary" href="/projects">Explore my work <ArrowUpRight size={17} /></Link>
          <Link className="button" href="/contact">Contact me <ArrowDownRight size={17} /></Link>{resumeUrl && <a className="button" href={resumeUrl} target="_blank" rel="noreferrer">Download résumé ↗</a>}
        </div>
        <p className="mono muted" style={{ marginTop: 24, fontSize: '.78rem' }}>{(profile?.degree ?? 'B.TECH CSE').toUpperCase()} · {(profile?.college ?? 'ELITTE COLLEGE OF ENGINEERING').toUpperCase()}</p>
      </div>
      <div aria-label="Abstract network illustration representing learning and software systems" role="img" className="network-art">
        <svg viewBox="0 0 360 360" width="100%" aria-hidden="true">
          <defs><radialGradient id="glow"><stop offset="0" stopColor="#78d9e8" stopOpacity=".22"/><stop offset="1" stopColor="#78d9e8" stopOpacity="0"/></radialGradient></defs>
          <circle cx="180" cy="180" r="155" fill="url(#glow)" />
          <g stroke="#40535b" strokeWidth="1.2" fill="none"><path d="M56 95 130 66 204 103 290 66M56 95 85 190 145 150 204 103 250 190 290 66M85 190 105 277 185 300 250 190 305 270M145 150 185 300M105 277 145 150M250 190 305 270M56 95 145 150 290 66" /></g>
          <g fill="#101214" stroke="#78d9e8" strokeWidth="2"><circle cx="56" cy="95" r="5"/><circle cx="130" cy="66" r="5"/><circle cx="204" cy="103" r="7"/><circle cx="290" cy="66" r="5"/><circle cx="85" cy="190" r="5"/><circle cx="145" cy="150" r="7"/><circle cx="250" cy="190" r="6"/><circle cx="305" cy="270" r="5"/><circle cx="105" cy="277" r="5"/><circle cx="185" cy="300" r="5"/></g>
          <circle cx="180" cy="180" r="34" fill="#171a1d" stroke="#78d9e8" strokeWidth="1.5"/><text x="180" y="185" textAnchor="middle" fill="#f2f0e9" fontFamily="monospace" fontSize="13">learn()</text>
        </svg>
        <div className="art-label mono">FIELD NOTE 001<br/><span style={{ color: 'var(--muted)' }}>curiosity → practice → progress</span></div>
      </div>
      <style>{`@media(max-width:760px){.wrap:has(.network-art){grid-template-columns:1fr!important;gap:26px!important}.network-art{max-width:340px;margin:auto}}.network-art{position:relative;max-width:380px;justify-self:end;width:100%}.art-label{font-size:.7rem;line-height:1.8;letter-spacing:.04em;border-left:1px solid var(--accent);padding-left:12px;margin-left:24px}`}</style>
    </section>

    <section className="section"><div className="wrap">
      <div className="section-heading"><p className="eyebrow mono">01 / CURRENT TOOLKIT</p><h2>Strong fundamentals first.</h2><p>A transparent snapshot of what I’m learning today. Skills will change as I practise, build, and gain evidence of progress.</p></div>
      <div className="skill-grid">{skills.length ? skills.map((skill, i) => <div key={skill} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span className="mono" style={{ color: 'var(--accent)', fontSize: '.78rem' }}>{String(i + 1).padStart(2, '0')}</span><span>{skill}</span></div>) : <p className="muted">Skills will appear here when published.</p>}</div>
      <style>{`.skill-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}@media(max-width:760px){.skill-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:420px){.skill-grid{grid-template-columns:1fr}}`}</style>
    </div></section>

    {projects.length > 0 && <section className="section"><div className="wrap"><div className="section-heading"><p className="eyebrow mono">02 / SELECTED PROJECTS</p><h2>Work that is ready to share.</h2><p>Only projects explicitly published from the private dashboard appear here.</p></div><div className="content-grid">{projects.map(project => <article className="card" key={project.id}><p className="eyebrow mono">{project.status.replace('_',' ')}</p><h3>{project.title}</h3><p className="muted">{project.summary}</p><Link href={`/projects/${project.slug}`} className="text-link">Read project notes <ArrowUpRight size={15}/></Link></article>)}</div></div></section>}

    <section className="section"><div className="wrap">
      <div className="section-heading"><p className="eyebrow mono">02 / WHAT I’M BUILDING TOWARD</p><h2>Learning by doing. Leading by sharing.</h2><p>My current story is about developing technical ability, helping other students learn, and bringing the same discipline to creative work.</p></div>
      <div className="focus-grid">
        <article className="card"><Code2 color="var(--accent)"/><h3>Software development</h3><p className="muted">Developing programming fundamentals and working toward practical web applications. Projects will be published when they are ready to share honestly.</p><Link href="/projects" className="text-link">Project journal <ArrowUpRight size={15}/></Link></article>
        <article className="card"><Users color="var(--accent)"/><h3>Coding Club leadership</h3><p className="muted">President of the Coding Club at Elitte College of Engineering, teaching C programming and supporting junior learners.</p><Link href="/experience" className="text-link">Experience & leadership <ArrowUpRight size={15}/></Link></article>
        {achievements.length > 0 && (
  <Link
    href={`/achievements/${achievements[0].slug}`}
    className="card achievement-focus-card"
    aria-label={`View full achievement: ${achievements[0].title}`}
  >
    <GraduationCap color="var(--accent)" />

    <h3>{achievements[0].title}</h3>

    <p className="muted achievement-focus-description">
      {achievements[0].description}
    </p>

    <span className="text-link achievement-focus-link">
      Read full achievement <ArrowUpRight size={15} />
    </span>
  </Link>
)}
        <article className="card"><Mic2 color="var(--accent)"/><h3>Beyond code</h3><p className="muted">Singing, guitar, tabla, and college drama direction are creative practices that add another dimension to my work.</p><Link href="/creative" className="text-link">Creative journal <ArrowUpRight size={15}/></Link></article>
      </div>
      <style>{`.focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.focus-grid h3{font-size:1.2rem;margin:18px 0 8px}.focus-grid p{line-height:1.75}.text-link{display:inline-flex;align-items:center;gap:7px;color:var(--accent);font-size:.9rem;margin-top:10px}@media(max-width:650px){.focus-grid{grid-template-columns:1fr}}`}</style>
    </div></section>

    <section className="section"><div className="wrap contact-panel"><div><p className="eyebrow mono">03 / OPEN TO CONVERSATION</p><h2>Have a relevant opportunity or idea?</h2><p className="muted">For professional conversations, technical discussions, or collaboration, use the contact page.</p></div><Link href="/contact" className="button button-primary">Get in touch <ArrowUpRight size={17}/></Link></div><style>{`.contact-panel{display:flex;align-items:center;justify-content:space-between;gap:24px}.contact-panel h2{font-size:clamp(1.8rem,4vw,3rem);letter-spacing:-.05em;margin:10px 0}.contact-panel p{line-height:1.75;max-width:580px}@media(max-width:650px){.contact-panel{align-items:flex-start;flex-direction:column}}`}</style></section>
  </>;
}
