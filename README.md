# DealerPulse

A dealership performance dashboard for a five-branch Toyota group. Surfaces sales KPIs, funnel diagnostics, and recommended actions for group leadership and branch managers.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This is a standard Next.js App Router project. No environment variables or database are required.

**Option A — Vercel CLI**

```bash
npm install
npm run build
npx vercel --prod
```

**Option B — Vercel Dashboard**

1. Push this repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Use the default Next.js settings and deploy.

The dataset ships in `data/dealership_data.json` and is bundled at build time.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Group overview — KPIs, insights, branch comparison, action queue |
| `/branches/[id]` | Branch review — funnel, officers, deliveries |
| `/reps/[id]` | Rep performance — individual funnel vs branch average |

See [DECISIONS.md](./DECISIONS.md) for product and technical decisions.

**As-of date:** 31 Dec 2025
