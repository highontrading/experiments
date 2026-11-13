# Ideabro Studio: Meta ad account insights (pulled 2026-11-13, read-only)

Account "ideabro studio" (INR). Lifetime data. Every campaign is currently paused.

## Funnel benchmarks from your own data (Vibe Editing, ₹1,999 course)
| Campaign | Spend | Purchases | Cost per purchase | ROAS | CTR (all) | CPM | Landing-page view cost |
|---|---|---|---|---|---|---|---|
| vibe-editing-3oct-broad | ₹66,712 | 80 | ₹834 | 2.40 | 3.82% | ₹555 | ₹21 |
| vibe-editing-30sep | ₹19,060 | 22 | ₹866 | 2.24 | 3.62% | ₹615 | ₹25 |
| vibe-editing-8oct-broad | ₹7,986 | 9 | ₹887 | 2.25 | 2.36% | ₹286 | ₹18 |
| vibe-editing-22oct-broad | ₹13,804 | 10 | ₹1,380 | 1.45 | 4.59% | ₹529 | ₹16 |
| **All Vibe Editing** | **≈₹1.08L** | **121** | **≈₹890** | **≈2.25** | | | |

Funnel rates (3 Oct campaign):
- Landing-page view → checkout started: **7.3%**
- Checkout → purchase: **35%**
- Landing-page view → purchase: **2.5%**

Average order value is about ₹1,999 (purchase value 159,920 ÷ 80).

## Winner concentration
- One ad ("2", vibe-editing-3oct-broad) drove **60 of 80 purchases**: ₹741 per purchase, ROAS 2.70.
  - ThruPlays were about 10% of impressions, roughly 3× the account's other ads, so it held attention unusually well.
  - The copy used "Stop editing. Start directing." with a demo-led video.
- **Typical pattern:** one creative carries the account, and fatigue raises cost per purchase within about 2–3 weeks (22 Oct campaign: ₹1,380).
- Ads are named "1", "2", "3". Use a naming convention so creative learnings can be read later.

## Other products
- **RPP workshops** (~₹630–740 average order value): ₹350–740 per purchase, ROAS 0.8–2.0. Volume works; profit is thin.
- **The UGC Lab (₹2,999):** about ₹6k spent across 3 tiny tests, **0 purchases**. That is too little spend to conclude anything, but it is a warning sign about the ₹2,999 price.
- **Retargeting (Vibe Editing):** ₹1.8k spent, 0 purchases. Retargeting pools are still small.
- **₹99 webinar:** ₹847 spent, CTR 6.5%, 3 sales. Low-ticket entry offers get very cheap clicks.

## Who buys (Vibe Editing)
- **Men 25–44 = about 90% of purchases.**
  - Men 35–44 had the best cost per purchase (₹686–797).
  - Men 25–34 had the most volume.
- Women 25–44 cost ₹1,450–2,540 per purchase. This may differ for AI & Advertising, whose beauty, fashion and food work appeals more to women, so keep targeting broad.
- 45–54 men also converted (₹780–810).

## Where they buy (placements)
- **Instagram Reels** gave the most volume (about 53 purchases, ₹650–1,285 each).
- **Instagram Feed:** about 32 purchases, ₹730–1,885.
- **Facebook Feed** was the cheapest big placement (₹445 in the 3 Oct campaign).
- **WhatsApp Status:** ₹376 per purchase on small volume. Keep it on.
- **Stories:** ₹700–1,100.
- Keep Advantage+ placements on.

## Tracking health
- Dataset "ideabro webinar" is active, with server events (Conversions API) firing hourly.
- **Purchase and InitiateCheckout: Event Match Quality 9.3/10**, with email, phone, fbc and fbp all at 100% coverage. Excellent.
- **PageView and ViewContent: EMQ about 6.1–6.2.** fbc coverage is 0.4% on ViewContent, so pass fbclid/_fbc on page events.
- The older "Idea bro pixel" has been inactive since August. Make sure the new course page fires only the active dataset.
