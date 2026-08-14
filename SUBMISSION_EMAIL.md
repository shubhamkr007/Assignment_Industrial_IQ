# Submission Email

Copy the subject and body below. Replace `[Your Name]` and `[Your Email]` if needed.

---

**Subject:** DealerPulse Take-Home Submission — Shubham Kumar

---

**Body:**

Hi,

Please find my submission for the Forward Deployed Engineer take-home assignment.

**Live demo:** https://dealerpulse-omega.vercel.app  
**GitHub:** https://github.com/shubhamkr007/Assignment_Industrial_IQ  
**Decisions doc:** https://github.com/shubhamkr007/Assignment_Industrial_IQ/blob/main/DECISIONS.md

### What I built

**DealerPulse** — a dealership performance dashboard for a five-branch Toyota group (CEO + branch managers).

- **Overview** with KPIs, trends, branch comparison, and an executive summary
- **Drill-down** from group → branch → sales rep
- **Action queue** with ranked, actionable recommendations (contact policy, delivery backlog, branch conversion gaps)
- **Diagnostic funnel** using full `status_history` (not just current status)
- **Filters** for period, source, model, and role-based “Viewing as” (CEO vs branch manager)
- **Rule-based summary engine** — narrative assembled from verified metrics, no external API

### Key finding in the data

Lakeside Toyota (Bangalore) converts at **7.6%** vs Downtown Chennai at **41.2%**. **114** lost leads never reached first contact — a process failure, not a single weak rep. December at Lakeside: 15 leads in, 15 lost, 0 delivered.

Full product rationale, tradeoffs, and next steps are in `DECISIONS.md`.

### Run locally

```bash
npm install && npm test && npm run dev
```

No environment variables or database required.

Happy to walk through any part of the implementation.

Best regards,  
Shubham Kumar  
[Your Email]  
https://github.com/shubhamkr007
