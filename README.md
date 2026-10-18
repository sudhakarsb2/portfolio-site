# Sudhakar Bhambade — Portfolio

A dark, Apple-style portfolio site with a private **studio dashboard** for editing
every word, project and photo — no code needed. Built with Next.js (App Router),
PostgreSQL and Drizzle ORM.

## Customise everything (no code)

Sign in at `/login` with the owner account (change the password in
**Settings** afterwards). Everything you save publishes to the site instantly.

| Dashboard section | What it controls on the site |
| --- | --- |
| **Projects** | Home grid, work archive and case-study pages. Cover images upload straight from your computer and are stored safely in the database; set tags, discipline, featured, draft/published. |
| **Messages** | Enquiries submitted through the contact form. Reply by email, archive, delete. |
| **Services** | The "What I produce" cards on the home and services pages, including deliverable lists and accent colours. |
| **Testimonials** | The recommendations rail on the home page and about page. |
| **Experience** | The career timeline (roles, companies, periods, full descriptions). |
| **Tags / Disciplines** | The filters on the work archive. |
| **Settings** | Profile photo (hero + about page), name, role title, hero sub-headline, the rotating headline words (comma separated), about text, brand ticker, skills, email, location, availability badge, LinkedIn URL, stat numbers and your password. |

Tip: a blank line in multi-line text fields starts a new paragraph.

## Run it locally

```bash
npm install
# point DATABASE_URL in .env at a Postgres database, then:
npx drizzle-kit push --config=drizzle.config.json
npm run dev
```

The first visit seeds the site content automatically (one account + demo content;
uploading your own photo and editing pages replaces it). Health check: `/api/health`.

## Publish it on your own (free) domain

This is a standard Next.js + Postgres app — you own the code and the data, so it
can live anywhere Node.js apps run. The free route:

1. **Push this folder to GitHub** (new private or public repository).
2. **Free Postgres:** create a free database on [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) and copy the connection string.
   Uploaded photos live inside Postgres, which is fine for a portfolio — just keep
   an eye on the free-tier storage limit.
3. **Free hosting:** on [Vercel](https://vercel.com) (free Hobby plan) choose
   *New Project → Import* your repository. Add two environment variables:
   - `DATABASE_URL` — your Postgres connection string
   - `NEXT_PUBLIC_SITE_URL` — your site URL (see step 4)
   Then **Deploy**. The build runs automatically; the database schema is created
   with `npx drizzle-kit push` (run once from your machine against the same
   `DATABASE_URL`), and the content seeds itself on first visit.
4. **Free domain:** Vercel gives you `your-project.vercel.app` for free.
   To use your own domain instead, go to the project on Vercel → **Settings →
   Domains** → add it (custom domains are also free on Hobby) and point your DNS
   `A` / `CNAME` records where Vercel tells you.
5. **Finish:** sign in at `your-domain/login`, change the owner password in
   **Settings**, upload your profile photo, and replace the placeholder case
   studies with your real work.

Alternatives to Vercel: Render, Netlify, Railway or any VPS that runs Node —
the app only needs `DATABASE_URL` and a Node runtime.

## Tech notes

- Auth: email + password (scrypt), cookie sessions, route guard in `src/proxy.ts`.
- Uploads: `POST /api/upload` (JPEG/PNG/WebP, resized in the browser, stored in
  the `media` table), served from `/api/media/[id]` with immutable caching.
- The seed is versioned (`SEED_VERSION` in `src/lib/seed.ts`): re-seeding
  preserves accounts, sessions and uploads — only the demo content is replaced.
