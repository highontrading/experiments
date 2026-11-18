import re
s=open('STATE.md').read()
card={
"Phase":"3b Build (the user chose: 3D in code, a new idea, CAROUSEL; Pace: through as before)",
"Format source":"none",
"Purpose":"cinematic (`/root/.claude/skills/cinecode/references/purpose-cinematic.md`)",
"Idea":"\"cant u make something high quality 3d thing\" → \"A new idea in 3D\" → CAROUSEL (user picked from 3): 3 a.m., an empty airport; adverts written for absent passengers play to an empty hall; phones left on the bags watch them and buy; a machine wrote the advert, a machine read it. (spark s3, overlap SHARES with prediction 3 changed: nobody is in the room, the twist is machines buying)",
"Medium":"3D realistic, in code (three.js, lit materials) (user)",
"Curiosity":"Q1 (0 s) why is a baggage belt playing adverts at 3 a.m.? → for passengers who are not there (14 s) · Q2 then who watches? → their phones (34-40 s) · paid at 46 s (a machine wrote it, a machine read it) and the page at 52 s that nobody answers",
"Format":"60 s, 16:9, 1920x1080, 24 fps · **Loop:** no · **Delivered to:** YouTube / LinkedIn / X",
"Look · mood":"night terminal, cinematic realistic · empty, cool, wry",
"Director card":"""
  - **Code fit:** three.js r186 on the kit's chain (tone mapping, AA, bloom, grain, vignette), rendered in software WebGL (SwiftShader; about 1.1 s a frame at 1080p). Everything is objects, light and space: the carousel (stainless rim, overlapping steel slats, rubber skirt, sloped island), suitcases (rounded shells, handles, wheels, zip lines, paper tags), phones (glass screens with live adverts), delivery boxes (kraft board, tape), seats, columns, screens, signage. No people: their absence is the subject. Floor: a planar mirror under a terrazzo layer (the screens reflect in it). What would look cheap: bare primitives and even light; route: bevelled geometry, a real key from ceiling spots with soft shadows, an environment map for steel, emissive screens that bloom.
  - **Structure:** a chain of two questions in one continuous shot; the turn at 46 s (the thesis), the page at 52 s answered by nobody.
  - **Form:** one continuous shot (the camera rides the belt, rises over the hall, goes in through the rubber flaps to the back hall, comes back out behind a bag, cranes up, settles on the empty help desk).
  - **Palette:** floor terrazzo #2a2826 (ground) · fluorescent #dfe7f2 (key light) · sodium accent #ffae5c (warm practicals: the café shutter, desk lamp) · steel #9aa3ab · screen adverts: saturated, each its own colour (the only colour in the hall) · kraft #b48a5a (boxes) · phone glow #f4f7ff. Blue-violet stays out of the ground.
  - **Atmosphere:** hall: high ceiling, fluorescent strips in rows, two warm spots over the carousel, night apron through the far windows (taxiway lights, a tail fin), air faintly hazy · back hall: dark, lit only by the wall of screens writing adverts and one work light over the robot arm · help desk: one warm desk lamp.
  - **Light arc:** cool hall (0-20) → the back hall lit by screens only (22-34) → the hall again, now dotted with phone glows (36-52) → one warm lamp at the empty desk (52-60).
  - **Camera:** perspective; one path, keyed: low ride on the belt (0-6), rising curve (6-14), descent into the flaps (14-22), lateral dolly past the screen wall (22-32), 180° turn behind a bag (32-36), low ride (36-44), crane up to overhead (44-52), drift to the desk and hold (52-60). Speed eases only at the ends.
  - **Motion:** belt 0.6 m/s, bags and boxes ride it; flaps swing on contact (damped); the robot arm: anticipate, move, settle; phones light on their own times; screens change advert every 1.5 s, the screen wall every 0.2 s.
  - **Tempo:** standard, 80 BPM (bar 3 s); the one shot paced by its spaces: 22 / 14 / 16 / 8 s.
  - **Motion design:** the adverts carry names (MAYA, JONAS, AHMET...) (job: the advert is for one absent person) · phones flip to ORDER PLACED (job: the machine buying, without a word) · the departures board reads 03:07 and CAROUSEL 4.
  - **Finish per scene:** hall: soft shadows, mirror floor, bloom on screens and strips, light haze; back hall: bloom on the screen wall, deep shadow; desk: bloom on the lamp; grain 0.04 throughout; no lens flares, no chromatic aberration.
  - **Ending:** the help desk, a service bell, an empty chair; the page goes unanswered; the screens behind keep playing in the mirror of the floor.
  - **Signature:** the airport chime (three notes) before every announcement; the last one rings and nobody comes.
  - **Checks:** 2 s the belt reads as a baggage carousel · 10 s the screens read as adverts with names · 21 s the flaps part · 28 s the screen wall reads as adverts being written · 40 s a phone's ORDER PLACED reads · 50 s the carousel full of boxes in an empty hall · 57 s the empty desk""",
"Finishing":"none of the three passes (motion blur off: render time)",
"Type":"quiet-cinema: Familjen Grotesk (signage and adverts) + Instrument Serif (unused unless a title) · agent pick · captions none",
"Sound (Q4)":"narrator + music · **Voice:** Lily (ElevenLabs), kept from Refrain for continuity (user can swap) · English · 54 words / 80 · treatment: radio in a hall (the airport PA), the chime before each line",
"Music":"code (user) · the user delegated the choices for these films; agent reason: hall muzak written for nobody (soft e-piano and pad through the PA), a machine pulse in the back hall; the chime is the signature",
"Sound identity":"an empty hall that hums; the belt rattles; the PA speaks to no one",
"References (Q5)":"skip",
"Key moments":"0 s the belt in motion (rattle) · 21 s through the flaps (slap) · 40 s ORDER PLACED (buzz) · 46 s the thesis · 52 s the page, then the bell nobody rings · **Thesis line:** \"A machine wrote the advert. A machine read it.\" · **Ending:** the empty desk",
"On-screen names":"none (signage in the world only)",
"Next action":"build the world and the path; stills; draft",
}
for k,v in card.items():
    s,n=re.subn(r'- \*\*'+re.escape(k)+r':\*\* [^\n]*', lambda m: '- **'+k+':** '+v, s, count=1)
    if not n: print('missing',k)
open('STATE.md','w').write(s)
