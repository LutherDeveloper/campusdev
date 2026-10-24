'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function applyToProject(formData: FormData) {
  const projectId = String(formData.get('projectId') ?? '');
  const message = String(formData.get('message') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || message.length < 10 || message.length > 1000) {
    redirect(`/projects/${encodeURIComponent(projectId)}?error=Pesan pengajuan harus 10–1000 karakter.`);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { error } = await supabase.from('project_applications').insert({ project_id: projectId, applicant_id: user.id, message });
  if (error) {
    const reason = error.code === '23505' ? 'Kamu sudah mengajukan diri ke proyek ini.' : 'Pengajuan gagal. Proyek mungkin sudah ditutup atau database belum diperbarui.';
    redirect(`/projects/${projectId}?error=${encodeURIComponent(reason)}`);
  }
  redirect(`/projects/${projectId}?message=Pengajuan berhasil dikirim.`);
}

export async function reviewApplication(formData: FormData) {
  const applicationId = String(formData.get('applicationId') ?? '');
  const projectId = String(formData.get('projectId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(applicationId) || !/^[0-9a-f-]{36}$/i.test(projectId) || !['accepted', 'rejected'].includes(status)) {
    redirect(`/projects/${encodeURIComponent(projectId)}?error=Data pengajuan tidak valid.`);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { error } = await supabase.from('project_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', applicationId);
  if (error) redirect(`/projects/${projectId}?error=Status pengajuan gagal diperbarui.`);
  redirect(`/projects/${projectId}?message=Status pengajuan diperbarui.`);
}
