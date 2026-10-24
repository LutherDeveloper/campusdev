# CAMPUSDEV MVP

Dark futuristic social network for student developers. Stack: Next.js App Router + TypeScript + Supabase Auth/PostgreSQL + Tailwind CSS v4.

## Features in this starter
- Landing page and dark responsive UI
- Email/password registration and login using Supabase Auth
- Cookie-based server-side sessions (`@supabase/ssr`) and Next.js 16 `proxy.ts`
- Protected dashboard
- Publish projects with category, skills, and desired teammates
- Edit student developer profile (university, major, bio, GitHub, skills)
- Project detail pages and team application workflow
- Project owners can review and accept/reject team applications
- Project feed backed by PostgreSQL
- SQL schema, profile-creation trigger, indexes, grants, and RLS policies

## Requirements
- Windows 11
- Node.js 20.9 or newer (use current LTS)
- VS Code
- Supabase account

## Setup on Windows PowerShell
1. Extract this project to `D:\GudangCode\campusdev`.
2. Open that folder in VS Code.
3. In VS Code Terminal (PowerShell), run:

   ```powershell
   npm install
   Copy-Item .env.example .env.local
   ```

4. Create a project at https://database.new.
5. In Supabase Dashboard, open SQL Editor, paste all of `supabase/schema.sql`, and run it.
6. In Supabase Project Settings / Connect, copy the Project URL and publishable key. Put them in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Do not put a secret/service-role key in a `NEXT_PUBLIC_` variable or commit `.env.local`.

7. In Supabase Authentication > URL Configuration, set Site URL to `http://localhost:3000`. Add `http://localhost:3000/auth/callback` to Redirect URLs.
8. Run:

   ```powershell
   npm run dev
   ```

9. Open http://localhost:3000, register an account, then sign in and create a project.
10. Open Profile to fill in your university, major, bio, GitHub URL, and skills.
11. Open a project card to view details and apply to join a team. A project owner can review applications from the same detail page.

## Email confirmation
If email confirmation is enabled, check your inbox after registering. For local-only testing, you may disable confirmation under Supabase Authentication settings; re-enable it before production. Configure SMTP before public launch.

## Important security notes
- RLS is enabled on the exposed tables. Keep it enabled and review policies before adding tables.
- The publishable key is intended for browser-visible apps; security depends on correct RLS. Never expose a secret/service-role key.
- Profiles and project feed are public in this MVP. Do not store phone numbers, home addresses, student numbers, or other sensitive data in public profile fields.
- This is an MVP, not yet production-ready: add rate limiting, anti-spam, report/block/moderation tools, pagination, automated tests, privacy/terms pages, email notifications, and backups before a public launch.

## Folder structure

```text
campusdev/
├── proxy.ts
├── .env.example
├── package.json
├── supabase/schema.sql
└── src/
    ├── app/
    │   ├── actions/auth.ts
    │   ├── actions/projects.ts
    │   ├── auth/login/page.tsx
    │   ├── auth/register/page.tsx
    │   ├── auth/callback/route.ts
    │   ├── dashboard/page.tsx
    │   ├── projects/new/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    └── lib/supabase/
        ├── proxy.ts
        └── server.ts
```
