'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const full_name = String(formData.get('full_name') ?? '').trim();
  const university = String(formData.get('university') ?? '').trim();
  const major = String(formData.get('major') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const github_url = String(formData.get('github_url') ?? '').trim();
  const skills = [...new Set(String(formData.get('skills') ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.slice(0, 30)))].slice(0, 20);

  if (full_name.length < 2 || full_name.length > 80) redirect('/profile?error=Nama harus 2–80 karakter.');
  if (university.length > 120 || major.length > 100 || bio.length > 500) redirect('/profile?error=Periksa panjang kampus, jurusan, atau bio.');
  if (github_url && !/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/.test(github_url)) redirect('/profile?error=Masukkan URL profil GitHub yang valid.');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { error } = await supabase.from('profiles').update({
    full_name, university: university || null, major: major || null,
    bio: bio || null, github_url: github_url || null, skills,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (error) redirect('/profile?error=Profil gagal disimpan. Pastikan schema terbaru sudah dijalankan.');
  redirect('/profile?message=Profil berhasil diperbarui.');
}
