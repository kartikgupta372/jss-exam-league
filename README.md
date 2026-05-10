# Exam League — JSS University Study Platform

> CIE & End-Sem co-pilot: AI notes · Quizzes · Leaderboard · Doubt Forum

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Phase 2 — Supabase Database Setup

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `exam-league` | Region: **ap-south-1 (Mumbai)**
3. Copy your **Project URL** and **anon key** from Settings → API

### Step 2 — Environment Variables

Create `.env.local` in the root (copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3 — Run SQL Migrations (in order)

Open Supabase Dashboard → SQL Editor → run each file:

| Order | File | What it creates |
|-------|------|-----------------|
| 1 | `supabase/migrations/001_profiles.sql` | profiles table + auto-create trigger |
| 2 | `supabase/migrations/002_subjects.sql` | subjects table |
| 3 | `supabase/migrations/003_materials.sql` | materials table |
| 4 | `supabase/migrations/004_quizzes_and_bookmarks.sql` | bookmarks, quizzes, quiz_questions, quiz_attempts |
| 5 | `supabase/migrations/005_doubts_moderation_karma_notifications.sql` | doubts, replies, upvotes, moderation, karma, notifications |
| 6 | `supabase/migrations/006_indexes.sql` | performance indexes |
| 7 | `supabase/migrations/007_rls_policies.sql` | Row Level Security on all tables |
| 8 | `supabase/migrations/008_triggers.sql` | karma, auto-block, notification triggers |
| 9 | `supabase/migrations/009_materialized_views.sql` | leaderboard views |

### Step 4 — Seed Data

Run in SQL Editor:
```sql
-- pastes supabase/seed.sql content
```

This loads **12 subjects** (2nd year) + **6 subjects** (1st year placeholder).

### Step 5 — Set Yourself as Admin

After your first Google login, run:
```sql
UPDATE public.profiles SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'kartikkartikgupta04@gmail.com'
);
```

### Step 6 — Storage Buckets

In Supabase Dashboard → Storage → Create buckets:

| Bucket | Public? | Max size | Allowed types |
|--------|---------|----------|---------------|
| `materials` | ❌ Private | 25MB | `application/pdf` |
| `avatars` | ✅ Public | 2MB | `image/*` |
| `doubt-images` | ✅ Public | 2MB | `image/*` |

### Step 7 — Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google
2. Add credentials from [Google Cloud Console](https://console.cloud.google.com)
3. Authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### Step 8 — Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set GROQ_API_KEY=gsk_your_key_here

# Deploy
supabase functions deploy generate-summary
```

### Verification Queries

```sql
-- Check all subjects loaded (should be 12 + 6)
SELECT year, COUNT(*) FROM public.subjects GROUP BY year;

-- Check RLS enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;

-- Check triggers are active
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Test RLS: this should return 0 rows if run without auth
SELECT * FROM public.bookmarks;
```

---

## Project Structure

```
src/
  App.tsx                    # All 20+ routes
  index.css                  # Full design system (glassmorphism)
  main.tsx                   # React entry
  pages/
    LandingPage.tsx           # Hero, stats, subjects, quiz cards
    LoginPage.tsx             # Google OAuth
    OnboardingPage.tsx        # First-login: name, year, branch
    YearPage.tsx              # Subject grid per year
    SubjectPage.tsx           # 4 tabs: notes/summaries/tests/videos
    MaterialPage.tsx          # PDF viewer + actions
    QuizPage.tsx              # Full quiz attempt (timer, palette, submit)
    QuizResultPage.tsx        # Score + leaderboard + WhatsApp share
    LeaderboardPage.tsx       # Podium + ranked list, 3 categories
    DoubtsPage.tsx            # Doubt forum + filters
    UploadPage.tsx            # Drag-drop upload + submission history
    ProfilePage.tsx           # Profile + bookmarks + quiz history
    admin/
      AdminQueuePage.tsx      # Two-pane approval queue + AI trigger
      AdminUsersPage.tsx      # User table + warn/block/unblock
      AdminStatsPage.tsx      # DAU chart + top subjects + bookmarks
  components/
    layout/NavBar.tsx         # Sticky nav + year toggle + mobile tabs
  lib/
    supabase.ts               # Typed Supabase client
    queryClient.ts            # TanStack Query config
    utils.ts                  # cn(), formatDate, formatNumber
  types/
    database.ts               # TypeScript DB types

supabase/
  migrations/                 # 9 SQL files — run in order
  functions/
    generate-summary/index.ts # Groq AI summary edge function
    _prompts.ts               # SUMMARIZE_NOTES system prompt
  seed.sql                    # 18 subjects + sample quizzes
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Styling | Vanilla CSS variables + glassmorphism |
| Icons | lucide-react |
| Animations | framer-motion |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| AI | Groq API → llama-3.3-70b-versatile |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#406aff` | Buttons, links, active states |
| `--tertiary` | `#f7dd7d` | Gold CTA (Sign in with Google) |
| `--success` | `#a3ff70` | Correct answers, progress |
| `--bg` | `#fbf8ff` | Page background (warm cream) |
| `--surface-card` | `rgba(255,255,255,0.72)` | Glassmorphic cards |

---

## Phase Roadmap

- [x] Phase 1 — Scaffold + All Pages + Admin UI
- [x] Phase 2 — Database Schema + RLS + Triggers + Seeds
- [ ] Phase 3 — Auth wired (Supabase Google OAuth live)
- [ ] Phase 4 — Materials library (real data from DB)
- [ ] Phase 5 — Upload pipeline + Admin approval
- [ ] Phase 6 — AI Summary edge function live
- [ ] Phase 7 — Quizzes (DB-driven) + Leaderboard
- [ ] Phase 8 — Doubt Forum live
- [ ] Phase 9 — Profile, Library, Stats dashboard
- [ ] Phase 10 — Deploy to Vercel + Launch

---

Built with ♥ at JSS University, Noida by Kartik Gupta
