This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## How player data goes live (static site)

Every page is built once per deploy and never regenerated, so visitors and bots
cause no ISR writes. URLs that weren't built (unknown player ids, lowercase
regions, etc.) return a plain 404.

New Supabase data goes live through a rebuild:

- **Automatically, once a day:** a Vercel Cron Job (`vercel.json`) calls
  `/api/rebuild`. That route compares the live Players data with the data the
  current deploy was built with, and triggers a redeploy only if something changed.
- **Right away:** `curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/rebuild`
  (add `?force=1` to redeploy even if nothing changed), or click Redeploy in the
  Vercel dashboard.

One-time setup in Vercel (Project → Settings):

1. **Git → Deploy Hooks:** create a hook for the `main` branch and copy its URL.
2. **Environment Variables:** add `VERCEL_DEPLOY_HOOK_URL` (the hook URL) and
   `CRON_SECRET` (any long random string, e.g. from `openssl rand -hex 32`).
3. Redeploy so the variables take effect.
