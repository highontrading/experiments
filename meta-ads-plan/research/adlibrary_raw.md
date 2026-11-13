# Meta Ad Library raw results (trimmed)

Collected 2026-11-13 via `ads_library_search` (Meta Ad Library API). ad_active_status=ACTIVE unless noted.

**API limitation (observed):** each result returns only page_name, page_id, ad_creative_link_title (the link headline, not the primary text/body), ad_creation_time, ad_delivery_start_time, currency and ad_snapshot_url. No body copy, no CTA type, no landing URL, no media type. Results come back newest-first, so for big keyword sets only ads started in the last ~1-3 days appear; longevity is only visible on page_id queries or small result sets. "Start" below = ad_delivery_start_time (UTC date). Formats/body hooks need the snapshot link opened manually.

Format per row: page (page_id) | currency | start | headline | snapshot id (https://www.facebook.com/ads/library/?id=<id>)

## S1. "AI ads course" — IN (est. 2,093 active)
Mostly generic digital-marketing institutes. Relevant rows:
- RealBe10x (118387377891652) | INR | 2026-11-13 | "Become AI-Proof Before It's Too Late" | 4721886918034824
- Design Gallery (1016806694851465) | INR | 2026-11-13 | "Master Meta Ads in Just 10 Days – ₹1,999" | 2114160392567865
- Zonfly Institute (463344353519712) | INR | 2026-11-13 | "10 Days AI Meta Ads Course – सिर्फ ₹1,500" | 2192206351646454
- Actionary.ai (1407354209129465) | INR | 2026-11-13 | "Reserve Your Seat Now." | 1092357690288020
- Stratechgy (1066422486795345) | INR | "AI-Powered Digital Marketing Course" | 986492160687355
- Entri Digital Marketing (117245571348763) | INR | "AI + Digital Marketing Course" | 1613525670815780
- HACA Marketing School (108218281891638) | INR | "Master Advanced AI Integrated Digital Marketing in 6 Months" | 4493339880905087
- Vinsup Skill Academy | INR | "100% MNC Job Placement | AI Tech Course | ... Non-IT to IT" | 1436556838239469
- Webhopers Academy | INR | "100% Job Placement" | 2143559636551900
- Digital Academy 360 | INR | "Live Classes + Agency Internship" | 1082824204764849
- Aone Academy | INR | "Learn Digital Marketing for ₹5,000" | 1087365264347319
- Pumo Technovation | INR | "Build Your Career With AI & Digital Marketing" | 2333419267414666
(+ ~30 more local DM institutes: Blitz Academy, Skill Circle Ranchi, Digiperform Patna, ITS Gwalior "Batch Starting Soon – Only 02 Seats!", regional-language Entri/EduStack/DICE ads.)

## S2. "AI UGC course" — US (est. 246 active)
- Simone Ferretti (443268645869191) | AED | 2026-11-13 | "Learn How To Make AI Content In 2 Days." | 1169118145690109, 1856698789090537 (4 variants)
- AI Avatar Ads (1066952459826413) | USD | 2026-11-12/13 | "Create AI Video Ads for Less — With AI-Powered Strategy!" | 1174503498264737 (4 variants)
- Content Creator.com (103977514809228) | USD | 2026-11-12 | "💚 Master AI Video Editing & Filmmaking In Hours, NOT Weeks (Black Friday Sale)" / "(Cyber Monday Sale)" | 2216834115567737, 1686304619711784 (40+ variants launched same hour = heavy creative testing)

## S3. "AI UGC" — IN (est. 1,364; polluted by "UGC-approved" degree ads)
- Claraverse (106888225663750) | INR | 2026-11-13 | "AI Influencer Live Workshop - Rs 199" | 1097611063270255, 1510139390979752
- Learn AI with Ritika (256634184191580) | INR | 2026-11-13 | "Turn AI Skills Into Income" | 2255259568377304, 2633984067099987, 1812058073417279
- Actionary.ai | INR | "Reserve Your Seat Now." | 2623332881453741
- 8 Figures Media (284600201399770) | INR | "Turn Real Creator Content Into Better Ads 🎬" | 1489723526381400
- Vosu AI (688065904380862, tool) | USD | "Your Product Isn't Boring. Your Creative Is." | 1433848668381854; "Turn Product Photos Into Video Ads — Bring product ideas to life with AI." | 4490601047865733
- Maino.ai (101344919141585) | INR | (no headline) | 1873470763996121

## S4. "AI product photography" — IN (est. 153)
- Vosu AI | USD | "No Studio. A Whole New Look. — Transform ordinary product images with VOSU AI." | 1638212447768239
- Smart Digital Store (1392762090589372) | INR | "Upgrade Your Jewelry Photos – Only $7.99" | 1545878507347416
- Old Town KId (778249465376886) | INR | 2026-11-11 | "Plain photo → premium ad" | 2324650621689584
- Kaizer (751212994747888) | INR | 2026-11-07 | "Turn Garments Into Stunning AI Model Images" | 1452523882876408
- Chal Raha Hai (738083396046031) | INR | 2026-11-10 | "200+ AI Product Photography Prompts | ₹149" | 1125882790154343
- BuildOur AI (317506564773643) | INR | 2026-11-08 | "2-Day AI Business Systems Workshop – ₹99" | 1936180117350161
- GenKit (1346584938529495) | INR | "Make Your Pet Products Stand Out with AI!" | 1497215732459568
- Slazzer | INR | "Turn Hours of Image Editing into Seconds with Slazzer AI ⚡" | 2153620138879491
- Toolkit & Resources | INR | "🔥 1 Lakh+ Digital Product Ideas (Rs. 99 Only)" | 1445014293744225
- Tyler Tometich (102655155235928) | USD | since >=2026-10-31 | "🌟Create MILLION VIEW Videos with your PHONE!" | 1854527499212954, 1429081052160686
- Prathamesh Jiwatode (387755038248335) | INR | "Build Your First Digital Product In 3 Hours" | 3046268595724341
- FTP Production House | INR | "E-Commerce Product Photography @ ₹250 Onwards" (real-shoot service = price anchor for "shoot vs AI") | 1783402276200231

## S5. page_ids=RealBe10x (118387377891652) — all countries (87 active)
Oldest active seen: 2026-11-07 (all 50 returned started 7–13 Nov) → Be10x rotates creatives every few days rather than letting single ads run for months; 4 headline families only:
- "Become AI-Proof Before It's Too Late" (most variants) | 4721886918034824, 1080234681717489, 1616124332779353
- "Supercharge Your Career with AI" | 1484134873782857, 1412496087534128
- "Learn AI Tools, Boost Productivity" | 2369483323824285, 1779227353342464
- "Learn AI Tools for Just ₹9" | 1174786362163205, 1106450122289482
- "Skill Up at ₹9" | 1444867540418147, 3353669121496070
Funnel (headline-observed): ₹9 entry offer (low-ticket workshop → upsell, inferred).

## S6. page_ids=Claraverse (106888225663750) — 2 active
- "AI Influencer Live Workshop - Rs 199" | 1097611063270255, 1510139390979752 (both started 2026-11-13)

## S7. "Outskill" — IN (est. 217)
Two pages: Outskill.com (1063172423549086) and Outskill (108677848986429). All seen started 2026-11-10/11, 20+ headlines launched in one batch:
- "3 hours that cost ₹0" | 4411743652470856, 1856010455429851 (Outskill, ~9 variants)
- "Learn Claude: Free Live Workshop" | 1127725153291689, 1349698750472441
- "Free Claude Workshop: Register Now" | 1767272247693360
- "Master Claude in One Live Workshop" | 1134869245761853
- "Stop Prompting. Start Building." | 4457510464499278
- "Learn to Delegate Work to Claude" | 1120930387313449
- "Learn Agentic AI: Free Live Workshop" | 2331502830723137
- "Be on the Right Side of the AI Line" | 1148238768017833
- "The AI Skill That Moves You Ahead" | 1699289098428377
- "Build an Agent That Works 24/7" | 1800079211270704
- "Build AI Agents. No Coding Needed" | 1474456827489330
- "Build Your Own AI Team" | 1403724541537305
- "Less Chaos. More Done." | 1883202582695456
- "Let AI Run Your Repetitive Work" | 1828139455056790
- "The Future of Work Is Agentic" | 1136263802148301
Funnel: FREE live workshop (3 hrs) → high-ticket programme (inferred from Outskill's known model). Tool-specific (Claude) hooks are the newest batch.

## S8. "GrowthSchool" — IN: no GrowthSchool page surfaced (keyword matched generic "school" ads). Not found via this tool.

## S9. "Nano Banana" — IN (est. 149; noisy)
- Deepak SIsodia (271128629412180) | INR | 2026-11-12 | "AI Hai Tu. Graphic Designer Nahi." | 1129816819817751
- Deepak SIsodia | INR | "Graphic Design Tools Aate Hain, Par Design Sense Missing Hai?" | 1145680934587595
- Deepak SIsodia | INR | "Future-Proof Skill: Design Thinking" | 29476271755394850
- The Growth Plus (828943693646118) | INR | "Learn AI Beyond Basic Prompts" | 1073753169055613
- Clicktools Pro (1226526410543817) | INR | since 2026-10-30 | "🎆 This Diwali, Create Unlimited AI Videos for ₹999!" (still active post-Diwali) | 1671186097784777
- Fash.Studio | USD | "Get Started with Fash Studio AI Tools" | 1283364111043340
- Kaizer / MAGIC AI SHOP etc. = AI-tool/ prompt-pack resellers ("Chat with us" WhatsApp CTA)
- Google | INR | "Google Gemini: Your AI companion" | 1283012367332073

## S10. "AI influencer course" — US (est. 1,086; mostly drama-app spam)
- MarketerHub (498218706707715) | USD | "Build an AI Influencer for $8/Mo" | 1140132235071127
- tommycetty (1041383905728199) | USD | "If I was starting over, I'd do this" | 2210534222869048
- Tyler Tometich | USD | "Viral VFX Bundle: 91% Off + Bonuses" | 1163336996056689 ; "🌟Create MILLION VIEW Videos with your PHONE!" | 1459187862225637
- Educly AI App | USD | "Start Your AI Journey Today" | 1439137971706485
- Aimble (1443835858809755) | USD | "Take the first step into AI" (multi-language, since ~2026-10-26) | 1302481875338531
