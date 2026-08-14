# DealerPulse

Real-time dealership performance dashboard for a five-branch Toyota group. Built for the **Forward Deployed Engineer** take-home assignment.

| | |
|---|---|
| **Live demo** | [dealerpulse-omega.vercel.app](https://dealerpulse-omega.vercel.app) |
| **Repository** | [github.com/shubhamkr007/Assignment_Industrial_IQ](https://github.com/shubhamkr007/Assignment_Industrial_IQ) |
| **Decisions doc** | [DECISIONS.md](./DECISIONS.md) |
| **Data as-of** | 31 Dec 2025 |

---

## What it does

DealerPulse helps a group CEO and branch managers answer three questions in under a minute:

1. **Are we selling enough?** — Retail units, revenue, and target attainment for the selected period.
2. **Which branch is the problem?** — Branch comparison, health labels, and conversion/contact rates.
3. **What should we do about it?** — Ranked action queue, executive summary, and deep links to branch/rep views.

---

## Assignment requirements

| Requirement | Implementation |
|-------------|----------------|
| Overview dashboard | `/` — KPIs, trends, target gauge, branch table, channel mix |
| Drill-down | Group → `/branches/[id]` → `/reps/[id]` via nav, search, and links |
| Actionable insights | Action queue + executive summary engine + insight banner on branch pages |
| Filtering / time range | Period picker (Jun–Dec, monthly, all), source, model, branch, CEO/manager view |
| Responsive design | Tailwind layout — desktop and tablet |
| Deployed on Vercel | Production at link above |
| DECISIONS.md | [DECISIONS.md](./DECISIONS.md) |

### Differentiators

- **Diagnostic funnel** — Stage reach from `status_history`, not current status alone; peer comparison bars.
- **Action queue** — Ranked recommendations with verb, count, value, and deep link.
- **Executive summary engine** — Rule-based narrative from verified metrics (`lib/ai/summarizer.ts`); no external API.
- **Scenario analysis** — What-if chip comparing lowest vs highest branch conversion.
- **Two time models** — Period metrics vs snapshot (open leads, aging, sold-not-delivered).
- **Shareable URLs** — `period`, `branch`, `source`, `model`, `view` query params.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Group overview — executive summary, KPIs, funnel, action queue, branch comparison |
| `/branches/[id]` | Branch review — funnel vs peers, officers, deliveries, lost reasons |
| `/reps/[id]` | Rep coaching — personal funnel vs branch; manager view lists officers |

**Try these links:**

- [Overview — December 2025](https://dealerpulse-omega.vercel.app/?period=december)
- [Lakeside Toyota branch](https://dealerpulse-omega.vercel.app/branches/B2?period=december)
- [All-time view](https://dealerpulse-omega.vercel.app/?period=all)

---

## Tech stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Data:** `data/dealership_data.json` (server-side import, no database)
- **Metrics:** Pure functions in `lib/metrics/` with unit tests
- **Deploy:** Vercel

No environment variables required.

---

## Run locally

```bash
git clone https://github.com/shubhamkr007/Assignment_Industrial_IQ.git
cd Assignment_Industrial_IQ
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build    # production build
npm run lint     # ESLint
npm run deploy   # deploy to Vercel (requires CLI login)
```

---

## Project structure

```
app/                    # Pages (overview, branch, rep)
components/
  dashboard/            # KPIs, funnel, action queue, executive summary
  charts/               # Recharts wrappers
  shell/                # Layout, nav, filters
lib/
  metrics/              # KPI and funnel calculations (tested)
  insights.ts           # Rule-based insight candidates
  ai/summarizer.ts      # Executive summary engine
  dashboard.ts          # Dashboard model builder
data/
  dealership_data.json  # Source dataset
DECISIONS.md            # Product & technical decisions
```

---

## Testing

```bash
npm test
```

Tests cover metric constants (510 leads, 160 deliveries, Lakeside 6 delivered, 114 never-contacted losses), branch health scoring, formatters, and the summary engine.

---

## Author

Shubham Kumar — [GitHub](https://github.com/shubhamkr007)
