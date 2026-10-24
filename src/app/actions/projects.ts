'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'Web Development');
  const skillsRaw = String(formData.get('skills') ?? '');
  const lookingFor = String(formData.get('lookingFor') ?? '').trim();
  if (title.length < 5 || title.length > 100 || description.length < 20 || description.length > 3000) redirect('/projects/new?error=Judul minimal 5 karakter dan deskripsi 20–3000 karakter.');
  const allowed = ['Web Development','Mobile Development','Cybersecurity','Data & AI','UI/UX Design','Other'];
  if (!allowed.includes(category)) redirect('/projects/new?error=Kategori tidak valid.');
  const skills = [...new Set(skillsRaw.split(',').map(s => s.trim()).filter(Boolean).map(s => s.slice(0,30)))].slice(0,10);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?error=Silakan masuk terlebih dahulu.');
  const { error } = await supabase.from('projects').insert({ user_id: user.id, title, description, category, skills, looking_for: lookingFor.slice(0,300) });
  if (error) redirect('/projects/new?error=Proyek gagal disimpan. Pastikan SQL database sudah dijalankan.');
  redirect('/dashboard?message=Proyek berhasil dipublikasikan.');
}
