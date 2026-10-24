import Link from 'next/link';
import { signIn } from '@/app/actions/auth';
import { ArrowLeft, LogIn } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{error?:string;message?:string}> }) {
  const { error, message } = await searchParams;
  return <main className="shell"><Link href="/" className="brand">CAMPUS<span>DEV</span></Link><section className="panel form"><Link href="/" className="project-meta row"><ArrowLeft size={14}/> Kembali ke beranda</Link><div className="eyebrow" style={{marginTop:24}}><LogIn size={14}/> Welcome back</div><h1>Senang melihatmu lagi.</h1><p className="muted">Masuk untuk melanjutkan proyek dan komunitasmu.</p>{error&&<div className="notice error">{error}</div>}{message&&<div className="notice">{message}</div>}<form action={signIn}><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="kamu@email.com"/></div><div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required placeholder="Password kamu"/></div><button className="btn primary" style={{width:'100%',marginTop:8}} type="submit">Masuk</button></form><p className="muted" style={{fontSize:13}}>Belum punya akun? <Link href="/auth/register" style={{color:'#a9b8ff'}}>Daftar gratis</Link></p></section></main>;
}
