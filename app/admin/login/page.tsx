import Link from 'next/link';
import { loginAction } from './actions';
export const metadata = { title: 'Administrator login', robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <section className="wrap" style={{ minHeight: '72vh', display: 'grid', placeItems: 'center', paddingBlock: 64 }}>
    <div className="card" style={{ width: 'min(100%, 440px)' }}>
      <p className="eyebrow mono">PRIVATE AREA / OWNER ACCESS</p><h1 style={{ fontSize: '2.5rem', letterSpacing: '-.06em', margin: '12px 0' }}>Admin sign in</h1>
      <p className="muted" style={{ lineHeight: 1.7 }}>Sign in with the administrator account created through the documented server-side setup process.</p>
      {params.error && <p role="alert" style={{ color: '#ffb4a9', marginTop: 18 }}>Sign-in failed. Check your credentials and try again.</p>}
      <form action={loginAction} style={{ display: 'grid', gap: 14, marginTop: 24 }}>
        <label style={{ display: 'grid', gap: 7 }}>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} style={fieldStyle}/></label>
        <label style={{ display: 'grid', gap: 7 }}>Password<input name="password" type="password" autoComplete="current-password" required maxLength={200} style={fieldStyle}/></label>
        <button className="button button-primary" type="submit" style={{ cursor: 'pointer', marginTop: 4 }}>Sign in securely</button>
      </form>
      <p className="muted" style={{ fontSize: '.82rem', marginTop: 18 }}>No public registration or default production password is provided.</p>
      <Link href="/" style={{ color: 'var(--accent)', fontSize: '.9rem' }}>← Return to portfolio</Link>
    </div>
  </section>;
}
const fieldStyle = { width: '100%', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 5, minHeight: 44, padding: '10px 12px' };
