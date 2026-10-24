import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, Users, Send, CheckCircle2, Clock3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { applyToProject, reviewApplication } from '@/app/actions/applications';

type Project = { id: string; user_id: string; title: string; description: string; category: string; skills: string[] | null; looking_for: string | null; status: string; created_at: string; profiles: { full_name: string; major: string | null; university: string | null; github_url: string | null; bio: string | null } | null };
type Application = { id: string; applicant_id: string; message: string; status: string; created_at: string; profiles: { full_name: string; major: string | null; university: string | null; github_url: string | null } | null };

export default async function ProjectDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; message?: string }> }) {
  const { id } = await params;
  const notice = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: projectData, error } = await supabase.from('projects').select('id,user_id,title,description,category,skills,looking_for,status,created_at,profiles(full_name,major,university,github_url,bio)').eq('id', id).maybeSingle();
  if (error || !projectData) notFound();
  const project = projectData as unknown as Project;
  const isOwner = user?.id === project.user_id;
  const [{ data: existingApplication }, { data: applications }] = await Promise.all([
    user ? supabase.from('project_applications').select('id,status').eq('project_id', id).eq('applicant_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    isOwner ? supabase.from('project_applications').select('id,applicant_id,message,status,created_at,profiles(full_name,major,university,github_url)').eq('project_id', id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
  ]);
  return <main className="shell">
    <header className="topbar"><Link className="brand" href="/">CAMPUS<span>DEV</span></Link><Link className="btn" href="/dashboard"><ArrowLeft size={16}/> Kembali</Link></header>
    {notice.error && <div className="notice error">{notice.error}</div>}{notice.message && <div className="notice">{notice.message}</div>}
    <article className="panel" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="spread" style={{ flexWrap: 'wrap' }}><span className="tag">{project.category}</span><span className="project-meta">{new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <h1 style={{ fontSize: 'clamp(30px,5vw,46px)', letterSpacing: '-.05em', marginBottom: 10 }}>{project.title}</h1>
      <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>
      <div style={{ margin: '18px 0' }}>{(project.skills ?? []).map(skill => <span className="tag" key={skill}>{skill}</span>)}</div>
      {project.looking_for && <div className="notice"><Users size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 7 }}/><strong>Mencari anggota:</strong> {project.looking_for}</div>}
      <div className="row" style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)', alignItems: 'flex-start' }}>
        <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,#5576ff,#8958f5)', fontWeight: 900 }}>{(project.profiles?.full_name ?? 'D').slice(0, 1).toUpperCase()}</div>
        <div style={{ flex: 1 }}><strong>{project.profiles?.full_name ?? 'Mahasiswa CAMPUSDEV'}</strong><p className="project-meta" style={{ margin: '5px 0' }}>{[project.profiles?.major, project.profiles?.university].filter(Boolean).join(' · ') || 'Student developer'}</p>{project.profiles?.bio && <p className="muted">{project.profiles.bio}</p>}</div>
        {project.profiles?.github_url && <a className="btn" href={project.profiles.github_url} target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a>}
      </div>
      {!user ? <div className="notice" style={{ marginTop: 24 }}>Masuk untuk mengajukan diri ke proyek ini. <Link href="/auth/login" style={{ textDecoration: 'underline' }}>Login</Link></div> : isOwner ? <section style={{ marginTop: 30 }}><h2 className="section-title">Pengajuan anggota ({applications?.length ?? 0})</h2>{!applications?.length ? <div className="empty">Belum ada pengajuan. Bagikan proyek ini ke komunitasmu.</div> : <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>{(applications as unknown as Application[]).map(app => <div className="card" key={app.id}><div className="spread"><strong>{app.profiles?.full_name ?? 'Mahasiswa'}</strong><span className="tag">{app.status}</span></div><p className="project-meta">{[app.profiles?.major, app.profiles?.university].filter(Boolean).join(' · ')}</p><p className="muted">{app.message}</p>{app.profiles?.github_url && <a className="btn" href={app.profiles.github_url} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a>}{app.status === 'pending' && <div className="row" style={{ marginTop: 12 }}><form action={reviewApplication}><input type="hidden" name="applicationId" value={app.id}/><input type="hidden" name="projectId" value={id}/><input type="hidden" name="status" value="accepted"/><button className="btn primary" type="submit"><CheckCircle2 size={14}/> Terima</button></form><form action={reviewApplication}><input type="hidden" name="applicationId" value={app.id}/><input type="hidden" name="projectId" value={id}/><input type="hidden" name="status" value="rejected"/><button className="btn" type="submit">Tolak</button></form></div>}</div>)}</div>}</section> : project.status === 'open' ? existingApplication ? <div className="notice" style={{ marginTop: 24 }}><Clock3 size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 7 }}/>Kamu sudah mengajukan diri. Status: <strong>{existingApplication.status}</strong></div> : <section style={{ marginTop: 28, borderTop: '1px solid var(--line)', paddingTop: 22 }}><h2 className="section-title">Tertarik bergabung?</h2><p className="muted">Ceritakan skill dan kontribusi yang bisa kamu bawa ke tim.</p><form action={applyToProject}><input type="hidden" name="projectId" value={id}/><div className="field"><label htmlFor="message">Pesan pengajuan</label><textarea className="input" id="message" name="message" minLength={10} maxLength={1000} rows={5} required placeholder="Hai! Aku tertarik bergabung karena... Skill yang bisa aku bantu adalah..."/></div><button className="btn primary" type="submit"><Send size={15}/> Ajukan diri</button></form></section> : <div className="notice" style={{ marginTop: 24 }}>Proyek ini tidak sedang membuka anggota baru.</div>}
    </article>
    <footer className="footer">CAMPUSDEV · Build together. Show your skills. Get discovered.</footer>
  </main>;
}
