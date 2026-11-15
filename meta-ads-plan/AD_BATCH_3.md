# Ad batch 3: three trailer ads in the winning format

This batch reuses the layout of **AIA_TRAILER_VID_v1**, the launch-CBO ad that is getting the sales (2 purchases at ₹1,456, CTR 4.25%).
- A two-line serif hook sits on top.
- The 16:9 trailer plays in the middle.
- The price bar `AI & ADVERTISING · 11 MODULES · ₹2,999` sits below it.
- Each ad ends on a 3.6 s end card with the price and CTA.

The source trailers are the three 16:9 masters from the Drive folder:
- `AI_in_Advertising_Trailer_YouTube_16x9_v2`
- `AI_in_Advertising_trailer_16x9`
- `ideabro_ai_in_advertising_16x9`

Trailers 2 and 3 tell their story in small kinetic text that becomes unreadable at feed size. So these two ads add a **caption line under the video**: words light up as they are spoken, and key words get a colour box. The Hinglish trailer already has its own burned-in subtitles, so it keeps the original layout exactly.

| # | File | Trailer | Language | Hook (top) | Accent | End card | Length |
|---|---|---|---|---|---|---|---|
| 1 | `out3/AIA_TRAILER_HI_SHOOT_VID_v1_4x5.mp4` | YouTube 16x9 v2 ("Ab shoot optional hai") | Hinglish | Ab shoot / **optional hai.** | yellow | dark: "Shoot-quality ads, bina shoot ke." · Enroll karo | 78.9 s |
| 2 | `out3/AIA_TRAILER_DIRECT_VID_v1_4x5.mp4` | trailer 16x9 ("the ones who shoot, the ones who direct") | English | Shoot it, / **or direct it?** | lime | cream: "The ones who shoot. And the ones who direct." · Enroll now · ₹2,999 | 54.6 s |
| 3 | `out3/AIA_TRAILER_SIDE_VID_v1_4x5.mp4` | ideabro 16x9 ("Which side are you on?") | English | Which side / **are you on?** | pink | dark: "Tools are easy. Taste is the skill." · Enroll now | 57.6 s |

All three ads:
- **Format:** 1080×1350 (4:5), 30 fps, audio normalised to −14 LUFS.
- **Link:** https://community.ideabrostudio.com/courses/ai-and-advertising
- **URL parameters:** `utm_source=meta&utm_medium=paid&utm_campaign=aia_trailers3&utm_content={{ad.name}}`
- **CTA button:** Learn more (the same as the winner).

The code is in `ads3/trailer_ads.py`; run `python3 ads3/trailer_ads.py` to re-render.

---

### 1 · AIA_TRAILER_HI_SHOOT_VID_v1 (Hinglish)
- **Primary text:**
  > Ek ad shoot ke liye kya kya chahiye? Studio, camera, crew, model… aur kam se kam teen hafte.
  >
  > Ab nahi. Product shoots, model shoots, UGC ads, CGI aur campaign films: sab AI se. Bina studio, bina crew.
  >
  > Generate button toh aaj sabke paas hai. Lekin AI se aisa ad banana jo shoot kiya hua lage, wahi asli skill hai.
  >
  > AI & Advertising · 11 modules · 41 lessons · lifetime access · ₹2,999
- **Headline:** Ab shoot optional hai.
- **Description:** 11 modules · 41 lessons · lifetime access
- **CTA:** Learn more

### 2 · AIA_TRAILER_DIRECT_VID_v1
- **Primary text:**
  > Every new medium splits advertisers in two. Print did it. TV did it. The internet did it.
  >
  > Now it's AI. Some brands still book the studio, the crew and the three-week shoot. Others turn one product photo into a whole campaign.
  >
  > AI & Advertising teaches you to be the one who directs: product shoots, model shoots, UGC and Meta ads, all made with AI.
  >
  > 11 modules · 41 lessons · ₹2,999, one-time.
- **Headline:** Shoot-quality ads, without the shoot
- **Description:** Lifetime access · self-paced
- **CTA:** Learn more

### 3 · AIA_TRAILER_SIDE_VID_v1
- **Primary text:**
  > Advertising has always followed the same pattern. A new medium arrives, and not every brand makes it across.
  >
  > Right now, AI is that medium. Anyone can press generate. The gap is between the people who press generate and the people who direct it.
  >
  > From the first brief to a launched campaign: product shoots, model shoots, campaign films, UGC and Meta ads. The tools are easy. Taste is the skill.
  >
  > AI & Advertising · 11 modules · 41 lessons · ₹2,999
- **Headline:** The tools are easy. Taste is the skill.
- **Description:** 11 modules · 41 lessons · lifetime access
- **CTA:** Learn more

---

## How to run them
- **Where:** add all three to the **same launch CBO** as AIA_TRAILER_VID_v1. That's the ad set already finding buyers, so the new trailers get judged against the winner on the same audience.
- **When to judge:** after about ₹3,000 of spend each (about 2× the current CPA). Keep any ad that gets a purchase, or 3 or more checkouts, at or below the winner's cost per checkout.
- **Placements:** the 4:5 file covers Feed. For Reels and Stories, Meta can use the original 9:16 trailers from the same Drive folder as the 9:16 asset in a placement-customised ad.
- **AI label:** as you asked for this account, I didn't tick Meta's AI-generated label.
