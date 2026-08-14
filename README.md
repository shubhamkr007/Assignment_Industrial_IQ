# DealerPulse

A dealership performance dashboard for a five-branch Toyota group. Surfaces sales KPIs, funnel diagnostics, and recommended actions for group leadership and branch managers.

**Repository:** [github.com/shubhamkr007/Assignment_Industrial_IQ](https://github.com/shubhamkr007/Assignment_Industrial_IQ)

**Live demo:** [dealerpulse-omega.vercel.app](https://dealerpulse-omega.vercel.app)

## Run locally

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This is a standard Next.js App Router project. No database is required.

**Optional — AI executive summary**

The overview page can generate an AI narrative when `OPENAI_API_KEY` is set. All metrics in the summary chips are computed server-side; the model writes qualitative headline and body text only (no invented numbers). Without a key, a metrics-based summary is shown automatically.

```bash
cp .env.example .env.local
# add OPENAI_API_KEY=sk-...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables AI narrative on overview |
| `AI_SUMMARY_MODEL` | No | Default `gpt-4o-mini` |
| `AI_SUMMARY_ENABLED` | No | Set `false` to disable AI |

**Option A — Vercel CLI**

```bash
npm install
npm run build
npx vercel --prod
```

**Option B — Vercel Dashboard**

1. Import [this repository](https://github.com/shubhamkr007/Assignment_Industrial_IQ) at [vercel.com/new](https://vercel.com/new).
2. Use the default Next.js settings and deploy.

The dataset ships in `data/dealership_data.json` and is bundled at build time.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Group overview — KPIs, insights, branch comparison, action queue |
| `/branches/[id]` | Branch review — funnel, officers, deliveries |
| `/reps/[id]` | Rep performance — individual funnel vs branch average |

See [DECISIONS.md](./DECISIONS.md) for product and technical decisions.

**As-of date:** 31 Dec 2025
