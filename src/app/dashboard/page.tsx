import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/auth';
import { Code2, Plus, Users, FolderKanban, Sparkles, Github, ExternalLink } from 'lucide-react';

type Project = { id:string; title:string; description:string; category:string; skills:string[]|null; looking_for:string|null; created_at:string; profiles:{full_name:string; major:string|null; university:string|null; github_url:string|null}|null };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{message?:string}> }) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const [{ data: profile }, { data: projects, error }] = await Promise.all([
    supabase.from('profiles').select('full_name,major,university,github_url').eq('id',user.id).maybeSingle(),
    supabase.from('projects').select('id,title,description,category,skills,looking_for,created_at,profiles(full_name,major,university,github_url)').order('created_at',{ascending:false}).limit(30),
  ]);
  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer';
  return <main className="shell"><header className="topbar"><Link className="brand" href="/">CAMPUS<span>DEV</span></Link><div className="navlinks"><span className="project-meta">{user.email}</span><Link className="btn" href="/profile">Profil</Link><form action={signOut}><button className="btn" type="submit">Keluar</button></form></div></header>
    <section className="spread" style={{alignItems:'flex-start',flexWrap:'wrap'}}><div><div className="eyebrow"><Sparkles size={14}/> Developer space</div><h1 style={{fontSize:'clamp(30px,5vw,46px)',letterSpacing:'-.05em',margin:'15px 0 8px'}}>Hey, {name.split(' ')[0]} <span className="gradient">👋</span></h1><p className="muted" style={{margin:0}}>Ide apa yang akan kamu bangun hari ini?</p></div><Link href="/projects/new" className="btn primary"><Plus size={17}/> Buat proyek</Link></section>
    {message&&<div className="notice">{message}</div>}
    <section className="stats"><div className="stat"><span className="project-meta">Proyek di feed</span><strong>{projects?.length ?? 0}</strong></div><div className="stat"><span className="project-meta">Status akun</span><strong style={{fontSize:19,color:'#91e5b0'}}>Aktif</strong></div><div className="stat"><span className="project-meta">Komunitas</span><strong style={{fontSize:19}}>Coming soon</strong></div></section>
    <section><div className="spread" style={{marginBottom:16}}><h2 className="section-title" style={{margin:0}}>Temukan proyek</h2><span className="project-meta">Terbaru</span></div>{error?<div className="notice error">Tidak bisa memuat proyek. Pastikan SQL schema sudah dijalankan di Supabase.</div>:!projects?.length?<div className="empty"><FolderKanban size={28} style={{margin:'0 auto 10px'}}/><h3>Belum ada proyek</h3><p>Jadilah yang pertama membagikan ide di CAMPUSDEV.</p><Link className="btn primary" href="/projects/new">Buat proyek pertama</Link></div>:<div className="grid">{(projects as unknown as Project[]).map(project=><article className="card" key={project.id}><div className="spread"><span className="tag">{project.category}</span><span className="project-meta">{new Date(project.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</span></div><h3><Link href={`/projects/${project.id}`}>{project.title}</Link></h3><p className="muted" style={{fontSize:14,display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{project.description}</p><div style={{margin:'12px 0'}}>{(project.skills??[]).map(skill=><span className="tag" key={skill}>{skill}</span>)}</div>{project.looking_for&&<p className="project-meta"><Users size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}}/>{project.looking_for}</p>}<div style={{borderTop:'1px solid var(--line)',marginTop:16,paddingTop:14}}><div className="row"><div style={{width:32,height:32,borderRadius:11,display:'grid',placeItems:'center',background:'linear-gradient(140deg,#5576ff,#8958f5)',fontWeight:900}}>{(project.profiles?.full_name??'D').slice(0,1).toUpperCase()}</div><div style={{minWidth:0}}><strong style={{fontSize:13,display:'block'}}>{project.profiles?.full_name??'Mahasiswa CAMPUSDEV'}</strong><span className="project-meta">{[project.profiles?.major,project.profiles?.university].filter(Boolean).join(' · ')||'Student developer'}</span></div>{project.profiles?.github_url&&<a className="btn" style={{marginLeft:'auto',padding:8}} href={project.profiles.github_url} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={15}/><ExternalLink size={12}/></a>}</div></div></article>)}</div>}</section>
    <footer className="footer">CAMPUSDEV · Build together. Show your skills. Get discovered.</footer></main>;
}
