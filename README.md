# SBU Dorm Review App

A clean MVP for browsing Stony Brook dorms by quad, comparing buildings, and submitting structured reviews with verified `@stonybrook.edu` authentication.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel-ready deployment structure

## Features

- Homepage with clear browse and review entry points
- Quad directory with aggregate stats
- Quad detail pages with type filtering and sort options
- Building pages with overall rating, category averages, and full review feed
- Email magic-link auth restricted to `@stonybrook.edu`
- Review submission with one review per user per building

## Local Setup

1. Fill in `.env.local` with your Supabase values.
2. Create a Supabase project.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
4. If you are updating an older database that still used `Communal`, run [`supabase/migrate-building-types.sql`](./supabase/migrate-building-types.sql).
5. Run [`supabase/seed.sql`](./supabase/seed.sql) to add starter quads and buildings.
6. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
7. Install dependencies with `npm install`.
8. Start the app with `npm run dev`.

## Notes

- The included seed data is a starter dataset for the MVP. You can adjust building inventory or naming directly in `supabase/seed.sql`.
- Reviews are public to read, but submitting requires a signed-in Supabase user whose email ends in `@stonybrook.edu`.
- User profile rows are created automatically from `auth.users` via a trigger in the schema.
