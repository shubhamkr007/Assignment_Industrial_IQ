# Decisions

DealerPulse is a performance dashboard for dealership leadership, focused on actionable insights rather than chart volume.

## Who this is for

The primary user is the group CEO who needs a quick read on monthly sales health: whether targets are being met, which branch is underperforming, and what operational issue explains the gap.

Branch managers use the same application via a **Viewing as** selector that opens their branch review page. Authentication was omitted per the assignment brief.

## What we built

Three routes and a prioritized insight panel.

1. **Overview** — KPIs, insight banner, branch comparison, diagnostic funnel, action queue, and delivery tracking.
2. **Branch review** — Branch-level funnel with peer comparison, officer workload, lost reasons, and delivery delays.
3. **Rep view** — Individual funnel versus branch average. Branch managers have no assigned leads; the page directs them to their officers.

### Key features

**Diagnostic funnel.** Stage counts are based on whether a stage appears in `status_history`, not on current `status`. Bars use each branch’s own lead volume so smaller branches remain comparable. The primary drop-off to monitor is `new → contacted`.

**Action queue.** A ranked list of recommended actions with a verb, count, value where relevant, and a deep link. Examples include contacting a branch manager, setting a contact policy, reviewing delayed deliveries, and reallocating effort across lead sources.

**Scenario analysis.** A simple comparison chip shows projected deliveries if the lowest-converting branch matched the top performer on the same lead volume.

## Data insights that shaped the product

Lakeside Toyota (Bangalore) converted **7.6%** (6 of 79). Downtown Toyota (Chennai) converted **41.2%** (40 of 97). Every Lakeside officer is below 12%. Venkat Mishra is at 4.5% with 12 never-contacted losses. This points to a branch-level process issue, not a single underperformer.

**114 of 288** lost leads never reached `contacted`. **112** journeys are exactly `new → lost`, with a median of 2.5 days. Median first response among contacted leads is about **46 hours**. The 24-hour contact SLA is rarely met.

December at Lakeside: **15 leads created, 15 lost, 0 delivered.** This is surfaced prominently when December is selected.

Walk-in converts at ~46%. Social media converts at ~14%. Channel mix is shown as supporting context.

**38** leads are in `order_placed` — sold but not yet delivered. Median `days_to_deliver` is 17 days. Downtown has the longest median wait (19.5 days).

Branch managers have **zero** assigned leads in the dataset. They appear in the org chart but not on rep leaderboards.

## Two time models

The dashboard uses two distinct time models to avoid misleading metrics.

- **Period** (controlled by the date picker): retail by `deliveries.delivery_date`, bookings by `order_placed` timestamp, intake by `created_at`.
- **Snapshot** (ignores the picker): current `status`, idle days from `last_activity_at`, wait time since `order_placed`.

The default period is **December 2025**. Funnel and conversion rankings use the **full Jun–Dec window**. December-created leads are right-censored: median new → order is about 20 days, then ~17 to delivery. Group-wide, 75 December leads produced 1 delivery. This is noted in the UI rather than used to rank branches.

The as-of date is fixed at **31 Dec 2025**. The dataset `generated_at` timestamp (March 2026) is ignored so the dashboard reflects the data window accurately.

## How targets are displayed

Total `target_units` is **1,426** against **160** deliveries (~11%). Every branch is behind target. Showing all branches in red would reduce signal, so the UI shows attainment alongside relative branch health.

Branches are ranked by conversion and operational SLAs. Health labels are **Top performer**, **Stable**, **Monitor**, and **At risk**.

## What we did not build

- **Aging as the primary metric** — As of 31 Dec, only about six open pre-order leads are idle 7+ days. Historical uncontacted losses are the stronger signal and appear in the action queue.
- **Forecasting** — Comparing 38 sold-not-delivered units to a 218-unit December group target would misrepresent the pipeline.
- **AI summaries, CSV export, maps, chatbots, anomaly detection, interactive what-if sliders, separate deliveries module, dark mode.**

Raw `status_history` notes are cleaned before display (e.g. the `"Customer comparing with {} competitor"` placeholder).

## Notable patterns

- Lakeside 7.6% vs Downtown 41.2%; Eastside ~37%; Highway and Central ~31–33%.
- Lakeside contact rate ~58% vs ~78–83% at other branches. 33 Lakeside leads lost without contact.
- 114 never-contacted losses group-wide; 24-hour contact rate among contacted leads is ~11.5%.
- Festive target increase in Oct–Nov; delivery peak in December (allocation lag).
- Eastside lost-reason mix skews competitive (Mumbai). Highway/Central skew to financing. Lakeside skews to “not ready”, “unresponsive”, and never contacted.
- Model mix affects average deal value: Glanza vs Camry are different segments.

Currency is formatted in ₹, lakhs, and crores. Phone numbers are masked to the last four digits.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Recharts, deployed on Vercel. JSON is loaded on the server. Metrics are pure functions in `lib/metrics/` with tests against known values: 510 leads, 160 deliveries, Lakeside 6 delivered, 114 never-contacted losses.

Shareable URLs support `period`, `branch`, `source`, `model`, and `view` query parameters.

### AI executive summary (Phase 1)

The overview page includes an executive summary layer:

- **Metrics** (retail units, contact rate, SLA, revenue) are always computed in `lib/metrics/` and shown as highlight chips.
- **Narrative** (headline and body) can be generated by OpenAI when `OPENAI_API_KEY` is configured.
- The model receives only pre-aggregated themes and branch health — not raw lead records.
- AI output is validated to reject numbers and currency so metrics cannot be hallucinated.
- On API failure or missing key, a deterministic summary is used with the same accurate KPI chips.
- Responses are cached for one hour per filter combination.

## Next steps

- Enforce a 24-hour contact SLA in the CRM, including blocking `new → lost` without a logged contact.
- Weighted pipeline forecasting for next-month retail.
- Eastside competitive-loss playbook (offer review, competitor tracking, test-drive follow-up).
- Lead source staffing aligned to conversion rates, not volume alone.
- Mid-month forecast compared to prior-month actuals rather than aspirational targets.
