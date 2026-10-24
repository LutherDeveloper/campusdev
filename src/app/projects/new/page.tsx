import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createProject } from '@/app/actions/projects';
import { ArrowLeft, Rocket } from 'lucide-react';

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{error?:string}> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  return <main className="shell"><header className="topbar"><Link className="brand" href="/">CAMPUS<span>DEV</span></Link><Link className="btn" href="/dashboard"><ArrowLeft size={16}/> Dashboard</Link></header><section className="panel" style={{maxWidth:760,margin:'0 auto'}}><div className="eyebrow"><Rocket size={14}/> Project hub</div><h1>Publikasikan ide kamu.</h1><p className="muted">Jelaskan apa yang sedang kamu bangun dan skill apa yang dibutuhkan untuk bergabung.</p>{error&&<div className="notice error">{error}</div>}<form action={createProject}><div className="field"><label htmlFor="title">Nama proyek</label><input className="input" id="title" name="title" minLength={5} maxLength={100} required placeholder="Contoh: Campus Expense Tracker"/></div><div className="field"><label htmlFor="description">Deskripsi proyek</label><textarea className="input" id="description" name="description" minLength={20} maxLength={3000} required rows={6} placeholder="Masalah apa yang ingin diselesaikan? Apa tujuan proyek ini?"/></div><div className="field"><label htmlFor="category">Kategori</label><select className="input" id="category" name="category"><option>Web Development</option><option>Mobile Development</option><option>Cybersecurity</option><option>Data & AI</option><option>UI/UX Design</option><option>Other</option></select></div><div className="field"><label htmlFor="skills">Skill yang dibutuhkan (pisahkan dengan koma)</label><input className="input" id="skills" name="skills" placeholder="React, UI/UX, PostgreSQL"/></div><div className="field"><label htmlFor="lookingFor">Anggota yang dicari</label><input className="input" id="lookingFor" name="lookingFor" maxLength={300} placeholder="Contoh: 1 frontend developer dan 1 UI/UX designer"/></div><button className="btn primary" type="submit">Publikasikan proyek</button></form></section></main>;
}
