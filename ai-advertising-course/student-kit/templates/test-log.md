# Ad Test Log

**How to fill:** Log every test. One row per ad, updated every 2–3 days. Don't judge an ad before it
has enough data (as a simple rule: at least 2,000–3,000 impressions and 2–3 days). Export the report from
Meta Ads Manager as CSV and give it to the `ad-performance-analyst` skill with this log.

**Key numbers (what they tell you):**
| Metric | Formula | Tells you |
|---|---|---|
| Hook rate | 3-second video views ÷ impressions | Does the first 3 s stop the scroll? |
| Hold rate | ThruPlays (or 15 s views) ÷ 3-second views | Does the middle keep them watching? |
| CTR (link) | Link clicks ÷ impressions | Does the ad make them want to click? |
| CPC | Spend ÷ link clicks | Cost of a visitor |
| CVR | Purchases ÷ link clicks | Does the landing page convert? |
| CPA | Spend ÷ purchases | Cost of a customer |
| ROAS | Purchase value ÷ spend | Money back per ₹1 spent |
| Frequency | Impressions ÷ reach | Rising above ~3 = people are tired of it |

---

## Test setup
- Test name:
- What we are testing (only one thing: hook / visual / offer / format):
- Campaign / ad set:
- Budget per day:
- Start date / check dates:
- Win rule (e.g. lowest CPA with at least 10 purchases):

## Results
| Date | Ad file name | Spend | Impr. | Hook rate | Hold rate | CTR | CPC | Purch. | CPA | ROAS | Freq. | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | |

**Decision codes:** KEEP · KILL · SCALE · ITERATE (make new versions of this)

## What we learned
1.
2.
3.

## Next round
| New ad | What changes | Why |
|---|---|---|
| | | |

---

## Filled example (sample numbers, for practice only)

| Date | Ad | Spend | Impr. | Hook | Hold | CTR | Purch. | CPA | ROAS | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| Day 3 | KESAR_DIWALI_GLOW_H01_VIDEO_9x16_v01 | ₹3,000 | 21,000 | 34% | 18% | 1.4% | 8 | ₹375 | 2.4 | SCALE |
| Day 3 | KESAR_DIWALI_GLOW_H02_VIDEO_9x16_v01 | ₹3,000 | 19,500 | 22% | 25% | 1.1% | 5 | ₹600 | 1.5 | ITERATE |
| Day 3 | KESAR_DIWALI_GLOW_H03_VIDEO_9x16_v01 | ₹3,000 | 23,000 | 15% | 12% | 0.6% | 2 | ₹1,500 | 0.6 | KILL |

**Learned:** "Three drops" macro hook stops the scroll best. H02 holds viewers well but the opening is weak.
**Next round:** H02 story with the H01 macro opening (2 s) · 3 new macro hooks · H01 as a 4:5 static.
