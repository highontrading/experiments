"""Voiceover scripts for the VO ads. Each line: (caption text shown on screen, text sent to TTS).
Hinglish lines send Hindi words in Devanagari so eleven_v4 pronounces them naturally; captions stay in Roman Hinglish."""
V = {  # ElevenLabs voices in the account
    "neeraj": "H9oourY5nVeVuzarh4D5", "rahul": "K0JkRcnnqtJOP749opMo", "jeet": "WfBTMYP9caYrcT3CNdFn",
    "anika": "RABOvaPec1ymXz02oDQi", "steven": "VMCgCMbBs53ElBxVD4VB", "don": "JJCR1UICgHnHljtvu5uF",
    "reyaansh": "YWaBwjubozVSPD1RgnRa", "jessica": "cgSgspJ2msm6clMCkdW9",
}
ADS = {
  "a01": {"voice": "neeraj", "lang": "hi", "lines": [
    ("Ek product shoot ka bill dekha hai?", "एक product shoot का bill देखा है?"),
    ("Studio. Photographer. Models. Stylist.", "Studio. Photographer. Models. Stylist."),
    ("Aur total? Lakhon mein.", "और total? लाखों में।"),
    ("Ab wahi shoot, ek product photo se.", "अब वही shoot, एक product photo से।"),
    ("AI & Advertising seekho. Sirf $29.", "AI and Advertising सीखो। सिर्फ़ twenty-nine dollars."),
  ]},
  "a03": {"voice": "steven", "lang": "en", "lines": [
    ("This is one product photo.", "This is one product photo."),
    ("This is the campaign it became.", "This is the campaign it became."),
    ("Studio shots. Lifestyle. Models. Motion.", "Studio shots. Lifestyle. Models. Motion."),
    ("No studio. No crew.", "No studio. No crew."),
    ("Learn it in AI & Advertising.", "Learn it in AI and Advertising."),
  ]},
  "a05": {"voice": "rahul", "lang": "hi", "lines": [
    ("Raat ke gyarah baje client ka message aaya.", "रात के ग्यारह बजे client का message आया।"),
    ("Kal subah tak naya ad chahiye.", "कल सुबह तक नया ad चाहिए।"),
    ("Brief. Concept. Visuals. Motion. Edit.", "Brief. Concept. Visuals. Motion. Edit."),
    ("Ek raat mein. Bina shoot ke.", "एक रात में। बिना shoot के।"),
    ("Subah tak ad live.", "सुबह तक ad live."),
  ]},
  "a06": {"voice": "don", "lang": "en", "lines": [
    ("Anyone can press generate.", "Anyone can press generate."),
    ("Few can direct.", "Few can direct."),
    ("Light. Colour. Composition.", "Light. Colour. Composition."),
    ("The real product. One look, every frame.", "The real product. One look, every frame."),
    ("Ads that look shot, not generated.", "Ads that look shot, not generated."),
  ]},
  "a09": {"voice": "jeet", "lang": "hi", "lines": [
    ("Twelve AI tools. Sabke paas hain.", "Twelve AI tools. सबके पास हैं।"),
    ("Par kaunsa tool, kab, kis ad ke liye?", "पर कौनसा tool, कब, किस ad के लिए?"),
    ("Yeh course poora stack sikhata hai.", "यह course पूरा stack सिखाता है।"),
    ("Sasta wala tareeka bhi.", "सस्ता वाला तरीका भी।"),
  ]},
  "a10": {"voice": "anika", "lang": "hi", "lines": [
    ("Diwali campaign, aur budget tight?", "Diwali campaign, और budget tight?"),
    ("Diyas, marigold, festive sets.", "दीये, गेंदे के फूल, festive sets."),
    ("Na studio, na set designer.", "ना studio, ना set designer."),
    ("Bas ek product photo, aur sahi direction.", "बस एक product photo, और सही direction."),
  ]},
  "a11": {"voice": "reyaansh", "lang": "en", "lines": [
    ("Ninety-nine dollars.", "Ninety-nine dollars."),
    ("Now twenty-nine.", "Now twenty-nine."),
    ("Eleven modules. Forty-one lessons.", "Eleven modules. Forty-one lessons."),
    ("Lifetime access. One payment.", "Lifetime access. One payment."),
  ]},
  "a12": {"voice": "jessica", "lang": "en", "lines": [
    ("Okay, real talk. None of these creators exist.", "Okay, real talk. None of these creators exist."),
    ("No casting. No shipping product. No reshoots.", "No casting. No shipping product. No reshoots."),
    ("This is AI UGC, and it feels native to the feed.", "This is AI UGC, and it feels native to the feed."),
    ("Learn exactly how in AI & Advertising.", "Learn exactly how in AI and Advertising."),
  ]},
  "a18": {"voice": "steven", "lang": "en", "lines": [
    ("The shoot is optional now.", "The shoot is optional now."),
    ("Shoot-quality ads.", "Shoot-quality ads."),
    ("Without the shoot.", "Without the shoot."),
  ]},
  "a19": {"voice": "jessica", "lang": "en", "lines": [
    ("Founders. Marketers. Designers.", "Founders. Marketers. Designers."),
    ("Freelancers. Creators. Students.", "Freelancers. Creators. Students."),
    ("If you need ads, this is for you.", "If you need ads, this is for you."),
    ("AI & Advertising. Twenty-nine dollars.", "AI and Advertising. Twenty-nine dollars."),
  ]},
}
