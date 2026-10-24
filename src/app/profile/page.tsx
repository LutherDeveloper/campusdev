import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, UserRound, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { updateProfile } from '@/app/actions/profile';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('full_name,university,major,bio,github_url,skills').eq('id', user.id).maybeSingle();
  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">CAMPUS<span>DEV</span></Link><Link className="btn" href="/dashboard"><ArrowLeft size={16}/> Dashboard</Link></header>
    <section className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="eyebrow"><UserRound size={14}/> Developer profile</div>
      <h1 style={{ fontSize: 36, letterSpacing: '-.04em', marginBottom: 8 }}>Kenali dirimu.</h1>
      <p className="muted">Lengkapi profil supaya mahasiswa lain tahu skill dan proyek yang ingin kamu bangun.</p>
      {params.error && <div className="notice error">{params.error}</div>}
      {params.message && <div className="notice">{params.message}</div>}
      <form action={updateProfile}>
        <div className="field"><label htmlFor="full_name">Nama tampilan</label><input className="input" id="full_name" name="full_name" minLength={2} maxLength={80} required defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ''} /></div>
        <div className="field"><label htmlFor="university">Universitas / kampus</label><input className="input" id="university" name="university" maxLength={120} defaultValue={profile?.university ?? ''} placeholder="Contoh: Universitas Prima Indonesia" /></div>
        <div className="field"><label htmlFor="major">Jurusan</label><input className="input" id="major" name="major" maxLength={100} defaultValue={profile?.major ?? ''} placeholder="Contoh: Sistem Informasi" /></div>
        <div className="field"><label htmlFor="bio">Bio</label><textarea className="input" id="bio" name="bio" rows={4} maxLength={500} defaultValue={profile?.bio ?? ''} placeholder="Ceritakan minat dan proyek yang ingin kamu bangun." /></div>
        <div className="field"><label htmlFor="skills">Skill (pisahkan dengan koma)</label><input className="input" id="skills" name="skills" defaultValue={(profile?.skills ?? []).join(', ')} placeholder="React, Python, UI/UX, SQL" /></div>
        <div className="field"><label htmlFor="github_url">URL GitHub</label><input className="input" id="github_url" name="github_url" type="url" defaultValue={profile?.github_url ?? ''} placeholder="https://github.com/username" /></div>
        <button className="btn primary" type="submit"><Save size={16}/> Simpan profil</button>
      </form>
    </section>
  </main>;
}
