"""Generate all voiceovers for the 20-ad batch with ElevenLabs (latest model: eleven_v4), with word timestamps.
Each VO is a list of (spoken_token, display_token) pairs so Hinglish can be spoken from Devanagari while the
captions show Roman Hinglish, and spelled-out prices can display as '₹2,999'. '' = merge into previous word."""
import os, sys, json, base64, urllib.request, urllib.error, concurrent.futures as cf

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "build", "vo2")
KEYS = [k for k in (os.environ.get("ELEVENLABS_API_KEY"), os.environ.get("ELEVENLABS_API_KEY_2")) if k]  # key 1 until its credits run out, then key 2
MODEL = "eleven_v4"
V = {"raj": "FwuKjlVpi0N3exead7ji", "jessica": "cgSgspJ2msm6clMCkdW9", "george": "JBFqnCBsd6RMkjVDRZzb", "liam": "TX3LPaxmHKxFdv7VOQHJ",
     "anika": "RABOvaPec1ymXz02oDQi", "rahul": "K0JkRcnnqtJOP749opMo", "reyaansh": "YWaBwjubozVSPD1RgnRa", "neeraj": "H9oourY5nVeVuzarh4D5"}

PRICE_EN = [("two", "₹2,999"), ("thousand", ""), ("nine", ""), ("hundred", ""), ("and", ""), ("ninety-nine", ""), ("rupees.", "")]
PRICE_HI = [("दो", "₹2,999"), ("हज़ार", ""), ("नौ", ""), ("सौ", ""), ("निन्यानवे", ""), ("रुपये", "")]


def en(s):  # plain English sentence -> pairs (display = spoken)
    return [(w, w) for w in s.split()]


def hi(vo, disp):  # parallel token lists
    a, b = vo.split(), disp.split(); assert len(a) == len(b), (len(a), len(b), vo); return list(zip(a, b))


SCRIPTS = {
    "e01": ("raj", en("Just got a quote for a product shoot? Studio. Photographer. Model. Crew. The bill adds up fast. "
                      "Now imagine: one product photo, and the skill to direct AI. Product shots, model shoots, video ads, all from your laptop. "
                      "Learn the whole workflow in AI and Advertising. Only") + PRICE_EN),
    "e03": ("jessica", en("This is all you start with: one product photo. From it, studio packshots. Lifestyle scenes. Model shots. "
                          "And a scroll-stopping video ad. One photo, one whole campaign. Learn how in AI and Advertising.")),
    "e04": ("george", en("Anyone can press generate. Few can direct. Feeds are filling up with AI ads that all look the same. "
                         "The difference is direction: light, colour, composition, and the human touch. That's what we teach. "
                         "AI and Advertising, by Ideabro Studio.")),
    "e07": ("raj", en("Midnight. A brief lands. New launch, ad needed by morning. No studio. No shoot. "
                      "Brief. Concept. Visuals. Motion. Edit. Launch. By sunrise, the ad is live. That's the workflow inside AI and Advertising.")),
    "e08": ("liam", en("Freelancers, designers, agencies, listen up. Brands need fresh ad creative every single week. "
                       "Learn to make product shoots, AI UGC and campaign films, then how to price and pitch them. "
                       "AI and Advertising. Eleven modules, and a capstone campaign for your portfolio.")),
    "e11": ("anika", en("Diwali. Wedding season. New Year. Every festival, your brand needs a fresh campaign. "
                        "Put your product in festive sets, on models, in motion, without a single shoot. "
                        "Learn it once in AI and Advertising, and make every season's ads yourself.")),
    "h01": ("rahul", hi("Shoot का budget नहीं है? कोई बात नहीं. एक product photo से पूरा campaign बनाओ. Product shoot, model shoot, video ad, सब AI से. सीखो AI and Advertising में. सिर्फ",
                        "Shoot ka budget nahi hai? Koi baat nahi. Ek product photo se poora campaign banao. Product shoot, model shoot, video ad, sab AI se. Seekho AI and Advertising mein. Sirf")
            + PRICE_HI + [("में.", "mein.")]),
    "h02": ("reyaansh", hi("ये ad shoot नहीं हुआ है. ना studio, ना model, ना crew. सिर्फ AI और direction. आप भी सीख सकते हो. AI and Advertising, by Ideabro Studio.",
                           "Ye ad shoot nahi hua hai. Na studio, na model, na crew. Sirf AI aur direction. Aap bhi seekh sakte ho. AI and Advertising, by Ideabro Studio.")),
    "h03": ("anika", hi("ये creator real नहीं है. ये unboxing भी real नहीं है. सब AI से बना है. Brands को हर हफ्ते नया UGC चाहिए. और आप बना सकते हो. सीखो AI and Advertising में.",
                        "Ye creator real nahi hai. Ye unboxing bhi real nahi hai. Sab AI se bana hai. Brands ko har hafte naya UGC chahiye. Aur aap bana sakte ho. Seekho AI and Advertising mein.")),
    "h04": ("neeraj", hi("Designer हो? Static post तो बना लेते हो. अब video ads, model shoots और AI UGC भी बनाओ. Clients को पूरा campaign दो. सीखो AI and Advertising में.",
                         "Designer ho? Static post toh bana lete ho. Ab video ads, model shoots aur AI UGC bhi banao. Clients ko poora campaign do. Seekho AI and Advertising mein.")),
}


def gen(name):
    voice, pairs = SCRIPTS[name]; text = " ".join(p[0] for p in pairs)
    mp3 = os.path.join(OUT, name + ".mp3")
    if os.path.exists(mp3): return name, "cached"
    body = json.dumps({"text": text, "model_id": MODEL}).encode()
    for i, key in enumerate(KEYS):
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[voice]}/with-timestamps?output_format=mp3_44100_128",
                                     data=body, headers={"xi-api-key": key, "Content-Type": "application/json"})
        try: d = json.load(urllib.request.urlopen(req, timeout=300)); break
        except urllib.error.HTTPError as e:
            if e.code in (401, 402, 429) and i + 1 < len(KEYS): continue   # quota exhausted -> next key
            raise
    open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"], open(os.path.join(OUT, name + ".json"), "w"))
    json.dump([p[1] for p in pairs], open(os.path.join(OUT, name + ".display.json"), "w"), ensure_ascii=False)
    return name, round(d["alignment"]["character_end_times_seconds"][-1], 2)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or list(SCRIPTS)
    print("chars:", sum(len(" ".join(p[0] for p in SCRIPTS[n][1])) for n in names))
    with cf.ThreadPoolExecutor(2) as ex:
        for r in ex.map(gen, names): print(r)
