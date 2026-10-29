import Link from 'next/link';

const links = [
  ['About', '/about'], ['Experience', '/experience'], ['Projects', '/projects'],
  ['Achievements', '/achievements'], ['Beyond Code', '/creative'], ['Contact', '/contact'],
] as const;

export function SiteHeader() {
  return <header style={{ borderBottom: '1px solid var(--line)' }}>
    <div className="wrap" style={{ minHeight: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
      <Link href="/" aria-label="Preet Majumdar home" style={{ fontWeight: 750, letterSpacing: '-.04em', whiteSpace: 'nowrap' }}>
        PREET<span style={{ color: 'var(--accent)' }}> / </span><span className="muted" style={{ fontWeight: 400 }}>FIELD NOTES</span>
      </Link>
      <nav aria-label="Main navigation" className="header-nav">
        {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
    </div>
    <style>{`.header-nav{display:flex;align-items:center;gap:20px;font-size:.86rem;color:var(--muted)}.header-nav a:hover{color:var(--text)}@media(max-width:900px){header .wrap{align-items:flex-start;flex-direction:column;padding-block:18px}.header-nav{flex-wrap:wrap;gap:12px 18px}}`}</style>
  </header>;
}
