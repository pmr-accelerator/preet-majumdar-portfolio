import Link from 'next/link';

export function ContentPage({ index, title, intro, children }: { index: string; title: string; intro: string; children?: React.ReactNode }) {
  return <section className="wrap" style={{ minHeight: '65vh', paddingBlock: 'clamp(60px, 10vw, 110px)' }}>
    <p className="eyebrow mono">{index} / DIGITAL FIELD NOTES</p>
    <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: .98, letterSpacing: '-.07em', maxWidth: 850, margin: '22px 0' }}>{title}</h1>
    <p style={{ maxWidth: 720, color: 'var(--muted)', lineHeight: 1.85, fontSize: '1.08rem' }}>{intro}</p>
    <div style={{ borderTop: '1px solid var(--line)', marginTop: 42, paddingTop: 28 }}>{children}</div>
    <p style={{ marginTop: 36 }}><Link href="/contact" style={{ color: 'var(--accent)' }}>Start a professional conversation →</Link></p>
  </section>;
}
