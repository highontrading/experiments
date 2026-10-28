// Carousel 01: The 5-Step Vibe Editing System.
// Each slide: a Notes card (the copy) and items (cards held by hands, or a pointing hand).
// Positions are the card centre in the 1080x1350 frame; times are seconds into the slide.
const L = (at = 0.5, o = {}) => [{ edge: "left", grip: "thumb", at, ...o }];
const R = (at = 0.5, o = {}) => [{ edge: "right", grip: "fingers", at, ...o }];
const RT = (at = 0.5, o = {}) => [{ edge: "right", grip: "thumb", at, flip: true, ...o }];
const B = (at = 0.45, o = {}) => [{ edge: "bottom", grip: "fingers", at, ...o }];
const BT = (at = 0.3, o = {}) => [{ edge: "bottom", grip: "thumb", at, ...o }];
const T = (at = 0.5, o = {}) => [{ edge: "top", grip: "thumb", at, ...o }];

window.CAROUSEL = {
  title: "The 5-Step Vibe Editing System",
  dur: 5,
  slides: [
    // 1 · Hook
    {
      notes: { title: "I stopped editing on a timeline.", size: 64, body: "My reels got better. Here's the 5-step Vibe Editing System I use instead. Swipe →", y: 700 },
      items: [
        { kind: "editor", x: 190, y: 300, w: 310, h: 230, rot: -10, hands: L(0.55), p: { mode: "messy" } },
        { kind: "file", x: 545, y: 190, w: 230, h: 330, rot: 3, hands: T(0.42), p: { press: 1.5, name: "launch_reel.vibe", todoAt: 2.3 } },
        { kind: "prompt", x: 895, y: 300, w: 290, h: 300, rot: 8, hands: R(0.55), p: { text: "fast, punchy, teal & orange, bold captions", at: 0.8 } },
        { kind: "reel", x: 205, y: 1135, w: 235, h: 410, rot: 9, hands: BT(0.3), p: { caps: [["NO", "TIMELINE"], ["GRIND."]], capsAt: 1.2, capEvery: 0.45, look: "teal" } },
        { kind: "grade", x: 860, y: 1110, w: 330, h: 250, rot: -11, hands: RT(0.6), p: { at: 1.4, scene: "sunrise" } },
      ],
    },
    // 2 · Problem
    {
      notes: { kicker: "The problem", title: "1 reel = 3 hours.", body: "Cutting. Syncing. Captions. Color. SFX. And it still looks \"meh\"." },
      items: [
        { kind: "clock", x: 185, y: 290, w: 260, h: 290, rot: -9, hands: L(0.5) },
        { kind: "tasks", x: 890, y: 290, w: 300, h: 340, rot: 7, hands: R(0.5), p: { at: 0.6, gap: 0.4, more: "+12 more" } },
        { kind: "editor", x: 230, y: 1110, w: 350, h: 250, rot: 8, hands: B(0.4), p: { mode: "messy", seed: 9 } },
        { kind: "render", x: 860, y: 1105, w: 320, h: 250, rot: -10, hands: RT(0.6) },
      ],
    },
    // 3 · Shift
    {
      notes: { kicker: "The shift", title: "Describe the vibe. AI does the clicks.", size: 58, body: "You type the feel, the edit builds itself, and you stay the director." },
      items: [
        { kind: "prompt", x: 200, y: 290, w: 330, h: 300, rot: -8, hands: L(0.55), p: { text: "30s reel, high energy, cut on the beat, bold captions, teal & orange", at: 0.6, cps: 34, fs: 20 } },
        { kind: "reel", x: 890, y: 280, w: 230, h: 400, rot: 8, hands: R(0.55), p: { caps: [["JUST", "TYPE"], ["THE", "VIBE."]], capsAt: 1.3, capEvery: 0.4, lookAt: 2.6, look: "teal" } },
        { kind: "chips", x: 225, y: 1110, w: 340, h: 250, rot: 9, hands: B(0.4), p: { at: 2.0, gap: 0.3 } },
        { kind: "editor", x: 860, y: 1110, w: 340, h: 250, rot: -9, hands: RT(0.6), p: { mode: "build", at: 2.0, rowGap: 0.25 } },
      ],
    },
    // 4 · Step 1
    {
      notes: { kicker: "Step 1 of 5", title: "Dump everything.", body: "Raw clips + one music track. Don't trim. Don't sort. Just drop it all in." },
      items: [
        { kind: "thumb", x: 180, y: 260, w: 280, h: 200, rot: -12, hands: L(0.5), p: { scene: "city", look: "log", label: "IMG_4821.MOV", len: "0:41" } },
        { kind: "thumb", x: 545, y: 175, w: 230, h: 260, rot: 4, hands: T(0.5), p: { scene: "ocean", look: "log", label: "IMG_4822.MOV", len: "1:12" } },
        { kind: "thumb", x: 900, y: 270, w: 270, h: 210, rot: 10, hands: R(0.5), p: { scene: "sunrise", look: "log", label: "IMG_4830.MOV", len: "0:18" } },
        { kind: "media", x: 255, y: 1110, w: 370, h: 330, rot: 7, hands: B(0.4), p: { at: 0.8, gap: 0.16 } },
        { kind: "wave", x: 860, y: 1100, w: 330, h: 220, rot: -10, hands: RT(0.6), p: { at: 9 } },
      ],
    },
    // 5 · Step 2
    {
      dur: 6,
      notes: { kicker: "Step 2 of 5", title: "Type the vibe.", body: "One sentence, five parts:", pills: ["Platform", "Length", "Energy", "Look", "Goal"], pillsAt: 0.7, pillsGap: 0.3, y: 640 },
      items: [
        { kind: "looks", x: 185, y: 250, w: 290, h: 320, rot: -9, hands: L(0.5), p: { at: 1.0, pick: 0 } },
        { kind: "reel", x: 895, y: 250, w: 220, h: 380, rot: 8, hands: R(0.55), p: { lookAt: 4.6, look: "teal", caps: [["END", "ON"], ["THE", "PRODUCT."]], capsAt: 4.4, capEvery: 0.3 } },
        { kind: "prompt", x: 540, y: 1105, w: 620, h: 270, rot: -3, hands: [{ edge: "left", grip: "thumb", at: 0.55 }, { edge: "right", grip: "thumb", at: 0.45, flip: true }],
          p: { text: "30s Reel · high energy · teal & orange · bold captions · end on the product", at: 2.3, cps: 36, fs: 25, press: 4.5 } },
      ],
    },
    // 6 · Step 3
    {
      notes: { kicker: "Step 3 of 5", title: "Cut to the beat.", body: "Ask for a cut on every beat (hype) or every 2nd beat (chill). Cuts that land on the beat feel pro." },
      items: [
        { kind: "bpm", x: 185, y: 270, w: 250, h: 250, rot: -10, hands: L(0.82) },
        { kind: "reel", x: 895, y: 270, w: 230, h: 400, rot: 8, hands: R(0.55), p: { cutEvery: 0.5, at: 0.5 } },
        { kind: "wave", x: 540, y: 1110, w: 640, h: 240, rot: 3, hands: [{ edge: "left", grip: "thumb", at: 0.5 }, { edge: "right", grip: "fingers", at: 0.5 }], p: { at: 0.9, gap: 0.2, beatPx: 48 } },
      ],
    },
    // 7 · Step 4
    {
      notes: { kicker: "Step 4 of 5", title: "Layer it.", body: "Captions → motion titles → one look. Add one layer at a time and check it before the next." },
      items: [
        { kind: "chips", x: 200, y: 270, w: 320, h: 250, rot: -9, hands: L(0.5), p: { list: ["Captions", "Motion GFX", "Teal & Orange", "B-roll", "Sound FX", "Transitions"], on: [0, 1, 2], at: 1.0, gap: 0.9 } },
        { kind: "layers", x: 890, y: 280, w: 300, h: 330, rot: 8, hands: R(0.5), p: { at: 1.0, gap: 0.9 } },
        { kind: "looks", x: 210, y: 1110, w: 300, h: 320, rot: 9, hands: B(0.4), p: { at: 2.2, pick: 0 } },
        { kind: "reel", x: 870, y: 1120, w: 240, h: 410, rot: -9, hands: RT(0.6), p: { caps: [["ONE", "LAYER"], ["AT", "A", "TIME."]], capsAt: 1.0, capEvery: 0.3, title: "VIBE EDITING", titleAt: 1.9, lookAt: 2.9, look: "teal" } },
      ],
    },
    // 8 · Step 5
    {
      notes: { kicker: "Step 5 of 5", title: "Sound + director pass.", size: 60, body: "Stamp 3–4 SFX on key cuts. Then give max 3 notes and let it re-cut." },
      items: [
        { kind: "sfx", x: 210, y: 280, w: 350, h: 230, rot: -9, hands: L(0.5), p: { at: 0.8, gap: 0.45 } },
        { kind: "sticky", x: 890, y: 280, w: 310, h: 300, rot: 8, hands: R(0.5), p: { at: 1.2, gap: 0.7 } },
        { kind: "reel", x: 205, y: 1130, w: 230, h: 400, rot: 9, hands: BT(0.3), p: { look: "teal", caps: [["PUNCHIER."]], capsAt: 1.4, title: "VIBE EDITING", titleAt: 2.4, liked: 3.2 } },
        { kind: "export", x: 860, y: 1105, w: 310, h: 260, rot: -10, hands: RT(0.6), p: { at: 3.2 } },
      ],
    },
    // 9 · Recap
    {
      dur: 5.5,
      notes: { title: "Save this for your next edit.", size: 56, checklist: ["Dump everything", "Type the vibe", "Cut to the beat", "Layer it", "Sound + director pass"], checkAt: 0.8, checkGap: 0.45, y: 715 },
      items: [
        { kind: "saved", x: 190, y: 225, w: 270, h: 330, rot: -9, hands: L(0.5), p: { at: 3.4 } },
        { kind: "file", x: 545, y: 160, w: 210, h: 290, rot: 3, hands: T(0.42), p: { press: 1.2, todoAt: 0.8 } },
        { kind: "prompt", x: 895, y: 235, w: 270, h: 280, rot: 8, hands: R(0.5), p: { text: "make it feel like a movie trailer", at: 0.9, fs: 19 } },
        { kind: "grade", x: 215, y: 1185, w: 300, h: 220, rot: 9, hands: B(0.4), p: { scene: "ocean", look: "film", name: "FILM 35" } },
        { kind: "editor", x: 870, y: 1185, w: 320, h: 220, rot: -9, hands: RT(0.6), p: { mode: "build", at: 1.0, rowGap: 0.3 } },
      ],
    },
    // 10 · CTA
    {
      notes: { kicker: "Free prompt pack", title: "Comment \"VIBE\"", size: 70, body: "and I'll DM you my free Vibe Editing prompt pack. Follow for one vibe edit a day.", y: 690 },
      items: [
        { kind: "comment", x: 195, y: 280, w: 300, h: 340, rot: -8, hands: L(0.5), p: { at: 0.9 } },
        { kind: "pack", x: 885, y: 255, w: 320, h: 200, rot: 8, hands: R(0.5), p: { at: 1.2 } },
        { kind: "dm", x: 220, y: 1110, w: 320, h: 300, rot: 8, hands: B(0.4), p: { at: 1.4 } },
        { kind: "follow", x: 850, y: 1115, w: 340, h: 240, rot: -8, float: 0, hands: RT(0.62), p: { press: 2.6 } },
        { kind: "tap", x: 836, y: 1198, ang: -72, taps: [2.6], over: true, inAt: 1.5, float: 0 },
      ],
    },
  ],
};
