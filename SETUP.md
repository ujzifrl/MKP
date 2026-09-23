# MKP — Setup Guide

This package is the working frontend + Supabase integration starter for MKP.

## 1. Install Node.js

Install the current Node.js LTS release:
https://nodejs.org/

Check it:
```bash
node -v
npm -v
```

## 2. Open this project

Open the `mkp` folder in VS Code.

Open a terminal in that folder and run:
```bash
npm install
npm run dev
```

Open the local URL Vite gives you.

## 3. Create Supabase

Create a project at:
https://supabase.com/

Open your project:
Project Settings -> API

Copy:
- Project URL
- anon/public key

Copy `.env.example` to `.env.local` and fill in:
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never put the Supabase service-role key in this frontend project.

## 4. Create the database

In Supabase:
SQL Editor -> New query

Paste everything from:
`supabase/schema.sql`

Run it.

## 5. Email verification

In Supabase:
Authentication -> Providers -> Email

Enable email/password signups.

For a production site, configure your email SMTP provider and set your Site URL / Redirect URLs to your real domain.

## 6. TOS

The supplied TOS text is included in the Terms page. Before launch, review it and add any rules/privacy/disclaimer language that applies to your actual service.

The database has a `tos_accepted` field and timestamp so acceptance can be stored per account.

## 7. Telegram

Open:
`src/App.jsx`

Find:
`ADD YOUR TELEGRAM USERNAMES HERE`

Replace it with your real support usernames.

## 8. Music

The three tracks you supplied are included in the selector:
- bleed — T7Z-VdEUdcY
- misery — TYy6BlUVhPU
- Tower of memories — OuNG2WeWdoA

The starter does NOT download/rip YouTube audio. For the live version, use YouTube's supported embed/player, or provide audio files you have permission to host.

## 9. Build

```bash
npm run build
```

If it succeeds, the production build is ready.

## 10. Deploy

A common option is Vercel:
https://vercel.com/

Import the project/repository and add the same environment variables in the Vercel project settings.

Then set the Supabase Auth Site URL and redirect URL to your Vercel/custom domain.

## Important production notes

- Keep the Supabase service-role key server-side only.
- Review storage/file-size limits before opening uploads to everyone.
- Add abuse reporting/moderation controls before making public uploads available.
- Add rate limits and CAPTCHA/Turnstile if spam becomes an issue.
- Review your final Terms of Service and privacy requirements for your jurisdiction.
