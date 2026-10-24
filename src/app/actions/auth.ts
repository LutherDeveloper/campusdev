
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signUp(formData: FormData) {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (
    fullName.length < 2 ||
    fullName.length > 80 ||
    !email.includes('@') ||
    password.length < 8
  ) {
    redirect(
      '/auth/register?error=Periksa nama, email, dan password minimal 8 karakter.'
    );
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    // Tampilkan penyebab asli di terminal development.
    console.error('[CAMPUSDEV signup error]', {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Registrasi gagal. Periksa email atau coba lagi.';

    redirect(`/auth/register?error=${encodeURIComponent(message)}`);
  }

  console.log('[CAMPUSDEV signup]', {
    userCreated: Boolean(data.user),
    sessionCreated: Boolean(data.session),
  });

  redirect(
    '/auth/login?message=Jika konfirmasi email aktif, cek inbox untuk verifikasi akun.'
  );
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/auth/login?error=Email dan password wajib diisi.');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[CAMPUSDEV signin error]', {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    redirect(
      '/auth/login?error=Email atau password tidak cocok.'
    );
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
