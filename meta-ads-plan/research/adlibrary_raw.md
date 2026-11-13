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

## S11. "AI video ads" — US (est. 8,060; ~60% drama-app spam)
- AI Video Academy (976145405587192) | USD | 2026-11-13 | "Create Professional AI Ads" | 4039210956386385
- AI VIDS LAB (1383834521487721) | EUR | 2026-11-13 | "Learn to Make Ads Like This" | 4630550173855469, 2205633817043717
- Space Ads Agency (372482713261310, AI video ad agency, PLN) | headline set: "AI video ads. Your product. New worlds." / "Sell the feeling. Show the product." / "Give products a character arc" / "Different worlds. Still product-led." / "One concept. Formats that fit." / "From product to a testable ad" / "Your product in an animated world" | 3809297259218009, 1184325607280529
- Zeely: AI Marketing Agent (1151257098081475) | USD | "Your Best Black Friday Ads. Unlock 70%" | 2246021822977073
- Vosu AI | USD | "Plans start at $1/month. Cancel anytime." | 1367260778670660
- Adbuddy - AI Marketer | USD | "Try it today 🙌" | 1133574272985217
- Sharif Mohsin (127988160393564) | USD | "FREE AI Dropshipping System" | 996232316877515
- Growth in Alignment | USD | "Scale by Subtraction™ [Free + Live - NOV. 17th]" (free live webinar format) | 1453184413593244
- Manus AI | USD | "Create and refine videos with ease." | 1720538289412907

## S12. "AI workshop" — IN (est. 6,955)
Be10x runs ≥5 pages in parallel: RealBe10x (118387377891652), TheBe10x.in (114496488283040), Be10x (117886597972692), Be10XSkills (920918137770473), Be10x.co (213843238482401):
- TheBe10x.in | "Learn AI at Just ₹9" | 1165784902639992, 1144371804623079
- Be10x | "Skill Up at ₹9" | 4067199653416976 ; "Learn AI Tools, Boost Productivity" | 1725640409132048
- Be10XSkills / Be10x.co | "Supercharge Your Career with AI" | 1709720687190021, 1488644759794013
Others:
- Claraverse | "AI Influencer Live Workshop - Rs 199" | 1097611063270255
- SMAI (1247171965142960) | "register now" (20+ variants) | 1456888006570646
- Shikkhar Suri New (966973059835492) | "Register for Live Workshop" | 1446516070389384
- apurv_sngh (110009680816524) | "Limited Seats!" | 1419641923484069
- Social Seller Academy (111563005253507) | "Book Fast | Limited Seats" | 2868599510192029
- Qubcabs Ai Digital Academy | "AI Workshop, Learner Edition" | 29460757120222289
- CJ Business with AI | "Every enquiry answered in seconds" / "Every quotation followed up on time" | 2357753198414205
- walkineducate_malad | landing = api.whatsapp.com (click-to-WhatsApp) | 1479063260843936

## S13. page_ids = AI Video Academy + AI VIDS LAB (7 active total)
- AI Video Academy: "Create Professional AI Ads" (2026-11-13) 4039210956386385; "AI Video Academy" (2026-11-12) 1813087753263846; "Create Amazing Content With AI" (2026-11-12) 960330956877938
- AI VIDS LAB: 4× "Learn to Make Ads Like This" (2026-11-13) 974308652003040, 4630550173855469, 2205633817043717, 2238669050023327
→ Both are small/new (≤4 ads, all <2 days old). Same niche as Ideabro ("learn to make AI ads") — still low competition on Meta.

## S14. page_ids = Learn AI with Ritika + Deepak SIsodia (26 active)
- Learn AI with Ritika: ~20 ads, ONE headline "Turn AI Skills Into Income"; oldest 2026-11-03 (10+ days; 17 variants launched same minute on 3 Nov = creative test, survivors still live) | 1592681535965810, 1438407686024040, 2255259568377304
- Deepak SIsodia (Hinglish design educator): "AI Hai Tu. Graphic Designer Nahi." / "Graphic Design Tools Aate Hain, Par Design Sense Missing Hai?" / "Graphic Design Ideas Nahi Aa Rahe? Process Seekho." / "Future-Proof Skill: Design Thinking" / "9 Design Courses for Just ₹969" (all 2026-11-09) | 1129816819817751, 1145680934587595, 1820313425961330, 1630098558596088

## S15. page_ids = Simone Ferretti (443268645869191) — 112 active, AED account, global
- "🚨 SALE 75% OFF" | oldest 2026-10-30 | 2065254377470999, 28519954591015946
- "🚨 CHRISTMAS 75% OFF" | 2026-10-31 → re-started 13 Nov | 1419642563482574, 1890753918961370
- "Built my setup for $200. Went viral." | 2026-11-01 | 1000128039808695, 39767115909570620
- "Learn How To Make AI Content In 2 Days." | 25+ variants 2026-11-11 and 2026-11-13 | 1409870684244578, 1169118145690109
- "Master AI Content Creation Now." | 2026-11-13 | 1105851052222915
- "🚨 BLACK-FRIDAY 75% OFF" / "Upgrade My Home Studio ✅" | 2026-11-13 | 4141551122815466, 1905604983781663
→ Permanent-discount framing (75% off, rebranded per season) + speed promise ("in 2 days").

## S16. "AI filmmaking course" — US (est. 266)
- Content Creator.com (103977514809228) | USD | 2026-11-12 | "💚 Master AI Video Editing & Filmmaking In Hours, NOT Weeks (Black Friday Sale)" / "(Cyber Monday Sale)" — 50+ variants launched within 1 hour on 12 Nov | 2216834115567737, 1686304619711784, 1113409531473918
- Marcus Levin (1135898492932797) | USD | "Learn Claude Step by Step" | 29348853548044242

## S17. "AI UGC ads" — US (est. 1,943)
- Victogrvphy (105671602074427) | USD | 2026-11-12 | "Video ads without the production shoot" / "Fresh video ads for your med spa" | 1143612668059779, 893413787126186
- AIVideo.com (305229502672606) | USD | 2026-11-12 | "Founders: don't clone yourself with AI" / "Founders: the ad format that scales" | 1681697689994462, 1130388149709153
- 0x ROAS (1131525280040255) | USD | "AI ADS SYSTEM for 9-fig brands" | 1110599198516030
- TryMako | EUR | "Create winning creatives consistently" | 2178921186311880
- Ku Creatives | IDR | "Your AI-Powered Ad Creative Team." | 1142506538677794
- Unflop | ILS | "Your Next UGC Script Should Beat Your Best" | 2175558199995093
- Ninjas AI Automations | JPY | "Unlimited AI video. No credits." / "Unlimited Seedance 2.0 & 2.5" | 1771128440632383
- Getyn | USD | "Create Videos, Content & Ads with AI 🚀" | 1884912269339236
- AI VIDS LAB, Simone Ferretti, AI Avatar Ads (as above)

## S18. "AI content creation course" — IN (est. 1,054)
- Digitalvalut Media (1251904841339404) | "Instant Access AI Influencer Course" / "Start Learning in Minutes" | 1112436828211532, 1184687090791323
- MS Digital (1246063315251586) | "AI Influencer Master Course ₹299" | 2236848823560807, 1663817192073911
- InstaGizmos (659368463917640) | "Create Your Own AI Influencer – Just ₹199!" / "Create Your Own AI Influencer From Your Phone" | 1146677714987892, 1852877589242211
- Digital Shakti (1148557108339032) | "🔥 9 Days AI Mini Course – Just ₹499!" | 4452832891649158
- Nextless Academy (108078602098378) | "🚀 Become an AI Creative Expert in Just 2 Months!" / "🎯 2 Months Mein AI Image & Video Creation Seekho!" / "📞 Enquire Now For Nextless AI Creative Mastery Program" | 4294165164214352, 1076186648792220, 1798433574774451
- Matchframe Editing School | "Become A Certified AI Powered Video Editor" | 1570832084800093
- Satyam AI (569370659597970) | "Claude AI Mastery – Full Course" | 1140624028463205
- GS Ai Academy | "AI Mastery 2.0 Course" | 3622103294616677
- The Growth Plus | "Learn AI Beyond Basic Prompts" | 1639204467455841
- DigiMark | "Diwali Dhamaka Offer! Learn Graphics Design & Social Media Marketing with AI – Join for Just ₹2,999!" | 1498322602189490
- Ankur Warikoo (107594063255738) | "Get ALL WebVeda Courses for the Price of One" | 1149749040849123 ; WebVeda.com | "Growth for Less Than ₹5.5/Day? 🤯" | 1843744993532332
- AI Business School | "Learn USA Affiliate Marketing @199/- Only." | 1115167854655356
- Infozub Digital Academy | "22 Professional Courses in One Bundle | ... 07 Days Refund Policy | Life Time Course Update" | 1492261869431712
- Loopive | "Claude AI മലയാളത്തിൽ പഠിക്കാം" (learn Claude in Malayalam) | 1344577671013934

## S19. page_ids = Digitalvalut, MS Digital, InstaGizmos, Digital Shakti, Nextless (13 active total)
All small (1–4 ads each), all started 2026-11-09 → 13. MS Digital's ₹299 ad was created 27 Oct but only delivering since 9 Nov.

## S20. "Higgsfield" — US (est. 318)
- Blake Ridder Teaches Filmmaking (105181061646262) | USD | "Hybrid AI Filmmaking | $79/month" | 1139706915452833
- Brother Ben X Ads (110294658338219) | USD | "Learn How To Do This Yourself" | 4519680708293483
- G3N ERA (1409130542275107) | USD | "How to make AI images" | 1133083219686771
- Arild (114891678177487) | USD | "Build Your AI Model Today!" / "Join the Skool now and launch your AI model!" | 2688776664905881, 2197559021158501
- VentureAligned | USD | "Start your AI influencer with Higgsfield." | 1468533031877732
- OpenCharts | USD | "More studio for less than Higgsfield Plus" | 1080961111646757
- Vibe.co | EUR | "Made with AI. Ready for TV." | 1676362260607604
- Adspo | AUD | "Claude can't watch your competitor's ads" | 1502328085084842
- foreplay.co | CAD | "Give your AI your entire ad stack" | 1114247174849185
- Naive AI | USD | "AI Videos on Autopilot" | 1848158146304714
- Sarah Williams | USD | "25+ Business and AI Tools for $29.95 a Month" | 29145067938521378

## S21. "AI photoshoot" — IN (est. 292)
- MastiLearn (373589079167523) | INR | "Post Daily Without a Photoshoot" | 1612273650665189
- Aivx Studio (1020971637770941) | INR | "CAD to Photoshoot in Minutes." / "WhatsApp for a free sample" (jewellery AI-shoot service, click-to-WhatsApp) | 28991977987130483, 1132140993123394
- Fame Sutra | INR | "💕 प्री-वेडिंग फोटो बनाएं AI से" | 1898139101168575
- Vosu AI | "Your Product Isn't Boring. Your Creative Is." | 1433848668381854
- Starvia - AI Product (1150949441431069) | USD | (no headline, 10+ ads) | 1046129201862001
- Jhalak AI (Tamil/Telugu consumer AI photo app) | 989881994189324

## S22. page_ids = Tyler Tometich (102655155235928) — 1,470 active (!)
Only two headlines in the newest 50: "🌟Create MILLION VIEW Videos with your PHONE!" and "Viral VFX Bundle: 91% Off + Bonuses". Ads seen from 2026-10-31 (id 1429081052160686) still live. Massive volume = scaled DTC info-product (VFX/AI video presets) with extreme creative churn.

## S23. "AI ads course" — GB + AE (est. 1,514; mostly drama spam)
- Creative Strategist Breakthrough (1369281022941561) | USD | "7 modules and 6 bonuses for $29" (same $29 price point as Ideabro) | 1787225645894384
- Stan vd Avoird | EUR | "Run ads without becoming a marketer" | 1490105576377188
- Rafi Shaik - Meta Ads | CAD | "🚀 Build a Buyers List for Just $9" | 1469691175126012
- The SAFEGUARDED Woman | USD | "Get the Training! $27" | 2333510074067047
- Filip The Creator | USD | "Learn More About Faceless Theme Pages" (15+ variants) | 2091593181490922
- Steven Cravotta | USD | "Build Your App in 4 Steps (Free Training)" | 1483189113730050

## S24. "AI agency clients" — US (est. 3,780)
- Marketixa (1351695108016968) | USD | "What Agencies Charge $5K/Mo To Run. Yours For $27" | 1681672826802112
- Evolved Agents Mastermind | CAD | "Build an AI Agency in 90 Days" | 1908744760255831
- Kai Bax - ScaleClients.io | AUD | "Pay In Full After This AI Gets Clients" | 2358272894933888
- Aretech | USD | "Add $200k-$2m/Year In Profit With AI" | 1138435201928198
- Jordan Lee (302225802970242) | GBP | "Free AI Business Workshop" / "Free AI Business Masterclass" | 3445656518951832
- Brook Hiddink | USD | "This FREE Training at 8 PM EST Might Piss Off Some "Gurus"" / "🚨 Final Notice - No More Excuses" / "Unlock Exclusive Access: FREE Live Event" | 1181986088021424, 1792585155354649
- Otto AI | USD | "Made for marketing agencies." | 1491032366259471

## S25. "D2C brand AI ads" — IN (est. 613)
- CINQA (1049037804970856) | INR | "100+ AI UGC creatives built for D2C brands scaling on Meta." | 1793973311825654
- Aipreneur.ai (211819585354973) | INR | "🎁 Get 3 Videos Absolutely FREE!" | 1153364320883532
- Digistick Services | INR | "Courier Your Products. We Create the Content." / "Product Shoots & Reels | Noida Studio" | 3513612912146221, 2178575659418050
- Zapzoomanimation | INR | "Complete Ad Film Production & Celebrity Endorsement" | 1133071869627358
- Growwkey (1441576629041025) | INR | "Your Next Income Skill Starts at ₹199 🚀" | 1106597115536141
- AiSensy | INR | "Run Meta ads with AI: ₹1,500 credits for ₹500" | 3578279545667188
- Perfomity D2C | INR | "₹2L → ₹16L/Month In 6 Months" | 1881534659537472
- Clickmize | INR | "Scale Your Home Décor Brand From ₹0 → ₹10 Lakh/Month In Just 3 Months." | 2453794971695230
- Digi.aman | INR | "Same Ad Budget. Revenue Doubled." | 1457056399729822
(= D2C founders are being targeted heavily by agencies/services, but almost nobody targets them with a *learn-to-do-it-yourself* AI ads course.)

---
Total searches: 25 (19 keyword, 6 page_id). All snapshot links: https://www.facebook.com/ads/library/?id=<id>
