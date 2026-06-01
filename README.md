# KITea

A vibe-coded module review platform for KIT students to share and discover honest reviews about their courses. Spill your tea about the modules ☕

Made by students, for students.

## What you get

- Next.js 15 (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Dark mode (theme toggle + CSS variables)
- Prisma ORM + PostgreSQL
- NextAuth/Auth.js with Google OAuth
- React Hook Form + Zod (used in the homepage search bar)
- ESLint + Prettier

## Folder structure

- `app/` - Next.js routes (`/`, `/login`, `/profile`) + API auth route
- `components/` - UI components (Navbar, Hero, Module cards) + shadcn primitives
- `lib/` - Prisma client (`lib/prisma.ts`) and env validation (`lib/env.ts`)
- `prisma/` - Prisma schema (`prisma/schema.prisma`)
- `public/` - icons and static assets

## Prerequisites

- Node.js 18+ (recommended)
- A Google OAuth project (OAuth Client ID/Secret)
- A PostgreSQL database

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
npm run prisma:generate
```

3. Run Prisma migrations (creates the tables used by NextAuth)

```bash
npm run db:migrate
```

4. Start the dev server

```bash
npm run dev
```

## NextAuth (Google OAuth)

- Add a Google OAuth credential in the Google Cloud Console.
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env.local`.
- Ensure `NEXTAUTH_URL` matches the URL you run the app on (e.g. `http://localhost:3000`).

## Starter UI components

- `components/navbar.tsx` - responsive navbar with theme toggle + login/profile UI
- `components/hero-section.tsx` - Apple-inspired hero + centered search bar (RHF + Zod)
- `components/popular-modules.tsx` - recent + popular module sections
- `components/module-card.tsx` - clean rounded “module” cards
- `components/footer.tsx` - footer slogan

## Commands

- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run lint` - lint
- `npm run typecheck` - TypeScript check
- `npm run format` / `npm run format:check` - Prettier
- `npm run prisma:generate` - generate Prisma client
- `npm run db:migrate` - run Prisma migrations

