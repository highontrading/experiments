# Edit in Your Language (Apni Bhasha Mein Edit Karo)

One standalone video (not an episode). A raw clip gets edited live on screen, and
each edit instruction is spoken in a different Indian language. At the end the finished
reel plays, and it is the video you have just been watching.

- **Format:** 9:16, 1080x1920, 30 fps, about 85 s
- **Voice:** ElevenLabs `eleven_v4`, confirmed on the account. It supports hi, bn, mr, te, ta, gu, kn, ml, pa and or.
- **Build:** the same HTML `renderAt(t)` → headless Chromium → ffmpeg pipeline as `../vibe-editing-carousels`

## Languages

The six most-spoken mother tongues (Census 2011), with English as the connecting thread:

| Language | Speakers (L1) | City and real shot | Edit it asks for |
| --- | --- | --- | --- |
| Hindi | ~53 Cr | Varanasi ghats | Trim the slow start |
| Bengali | ~9.7 Cr | Kolkata yellow tram | Cut on the beat |
| Marathi | ~8.3 Cr | Mumbai local train | Speed it up |
| Telugu | ~8.1 Cr | Hyderabad, Charminar | Warm colour grade |
| Tamil | ~6.9 Cr | Chennai, Marina beach | Bigger captions |
| Gujarati | ~5.5 Cr | Ahmedabad, Uttarayan kites | Subtitles in every language |

Kannada, Malayalam, Punjabi and Odia appear in the finale as a greeting chorus.

## Script

Native speakers should check the lines before the final voice render.

| Time | Voice | Line | Layout |
| --- | --- | --- | --- |
| 0–7 | EN | "India speaks in hundreds of languages. For years, editing software understood just one." | A · cloud lettering |
| 7–12 | EN | "Not anymore. Here's a raw clip. Six languages are about to edit it." | B · clothesline |
| 12–21 | HI | घाट वाला शॉट डालो, और शुरू के दो सेकंड काट दो। | B · clothesline: the first 2 s of the film strip is snipped and its peg drops |
| 21–30 | BN | ট্রামের শটটা দাও, আর মিউজিকের বিটে বিটে কাট করো। | C · collage: a cut-out tram rides the rope and bow markers snap onto each beat |
| 30–39 | MR | लोकलचा शॉट टाका, आणि थोडा फास्ट करा. | E · tabletop on the checkerboard grass: the local train races across the tiles |
| 39–48 | TE | చార్మినార్ షాట్ పెట్టండి, కలర్ కొంచెం వార్మ్ చేయండి. | D · window on the hill: Charminar in the yellow window, and the light warms |
| 48–57 | TA | மெரினா ஷாட் போடுங்க, கேப்ஷன்ஸ் கொஞ்சம் பெருசா பண்ணுங்க. | D2 · push through the blue shutters to Marina, where the Tamil caption grows huge |
| 57–67 | GU | પતંગનો શોટ મૂકો, ને સબટાઇટલ બધી ભાષામાં આપો. | F · poster: kites cross the sky, each tail carrying a subtitle in a different script |
| 67–76 | (music) | The finished "Morning in India" reel plays, cut to the beat | A phone floating in the sky, which then shrinks into the hill's windows |
| 76–85 | EN/Hinglish + chorus | "Six languages. One edit. No timeline. That's vibe editing. Ab edit karo, apni bhasha mein." | A · cloud lettering: APNI BHASHA. APNA EDIT. |

Speakers are voice only. Each one gets a white pill bubble in their own script and a
`(Kolkata)。` style label. No lip-synced faces, so nothing looks AI-generated.

## Layouts, taken from the reference posters

- **A, cloud lettering** (PLAYGROUND poster): words formed from real cloud texture
- **B, clothesline and wooden pegs** (O² / Tuhoon posters): clips pegged like prints, forming the reel's timeline
- **C, cut-out collage** (Tuhoon): real background-removed photos hanging from pegs, with bows as beat markers
- **D, windows on a green hill** (Vanke poster): coloured window frames that each open onto a city
- **E, surreal tabletop** (PLAYGROUND bottom): red table on the checkerboard path across the grass
- **F, big poster type** (O²): lime display type, magenta handwriting, tiny scattered lime labels

**Palette:** sky #3f8fd8 → #9cc8ec · lime #d4f23c · magenta #e0245e · peg wood #c99a52 ·
grass #5f9a3c · frames yellow #e2b521 / red #d8432f / blue #6f9fcf / navy #3b4a78 · film grain throughout

**Type:** Archivo Expanded for Latin headlines, Caveat for handwriting, and the Baloo 2
family for the Indian scripts. Baloo has a matching cut for every script (Baloo 2,
Baloo Da 2, Baloo Thambi 2, Baloo Tammudu 2, Baloo Bhai 2), so all six languages look like one family.

## Transitions (Apple-style)

- **One continuous world:** sky above, hill below. The camera tilts and pushes instead of cutting.
- **Shared-element morphs:** a pegged print becomes the next window's picture, and a caption chip flies into the next scene.
- **Push-through:** the camera flies through an open window into the next city.
- **Cloud wipes:** a soft cloud drifts past the lens to hide a scene change.
- **Motion:** spring easing (cubic-bezier(.2,.8,.2,1)), motion blur on fast moves, and one grain layer over everything.
- **Sound:** city ambience crossfades under each language, with soft whooshes on the moves.

## Real assets: what this environment can reach

| Source | Status | Use |
| --- | --- | --- |
| Wikimedia Commons | reachable, needs pacing | real city footage and photos (CC; credit them in the end card or caption) |
| archive.org | reachable | archival footage and city ambience |
| Library of Congress | reachable | archival stills |
| Mixkit | reachable | free stock video, music and SFX |
| Google Fonts | reachable | Baloo / Noto Indian fonts |
| Pexels, Pixabay, Unsplash, Flickr | **blocked** | add them to the environment's allowed domains (plus a Pexels API key) to use them |

Cut-outs are made from real photos with rembg background removal. Nothing is AI-generated.

## Voice budget

- The account is on the Starter plan, with 31,259 of 40,000 characters used and **about 8,700 left** this cycle.
- The script is about 1,100 characters, which leaves room for roughly 5 full takes, or an extra Hinglish-thread version.
- Use the `with-timestamps` endpoint so captions highlight word by word, in sync.
- One native-accent voice per language, picked from the voice library.

## Two backup topics

1. **Ek Kahaani, Chhe Awaazein:** one story (a chai seller's morning) told as a relay, with each language continuing the sentence. More emotional, less about editing.
2. **Same Reel, Six Dubs:** one reel auto-dubbed into six languages, shown as a split-screen grid. A simpler demo of AI dubbing.
