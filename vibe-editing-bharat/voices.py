# Find each chosen shared voice's owner id and add it to the account's library.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ["ELEVENLABS_API_KEY"]
CHOSEN = {  # lang: (voice_id, name filter used for search)
    "en": "1U02n4nD6AdIZ9CjF053",  # Viraj - Smooth and Gentle (Indian English)
    "hi": "9w21nMuk8CWXIME31V1S",  # Simran - Young, Friendly and calm
    "bn": "1JOQMQINvsOLiEu2pZFd",  # Ashwat - Calm, Pleasant Storyteller
    "mr": "aZaMD7e0iu6aJpSocGIY",  # Kalyani - Warm Marathi Conversational
    "te": "4XvBGCPMXWyVQa75dbZg",  # Madhavi - Clear & Natural Conversation
    "ta": "gJvkwI7wGFW2czmyfJhp",  # Muthu - Narrative, Calm and Informal
    "gu": "3L29IUUN61xcyvsKscMy",  # Chinmay - Wise Gujarati Friend Voice
}
def api(path, data=None):
    req = urllib.request.Request("https://api.elevenlabs.io" + path, headers={"xi-api-key": KEY, "content-type": "application/json"},
                                 data=json.dumps(data).encode() if data is not None else None, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req) as r: return json.load(r)
mine = {v["voice_id"] for v in api("/v1/voices")["voices"]}
for lang, vid in CHOSEN.items():
    if vid in mine: print(lang, vid, "already in library"); continue
    lang_q = "en&accent=indian" if lang == "en" else lang
    owner = None
    for page in range(5):
        res = api(f"/v1/shared-voices?language={lang_q}&page_size=100&page={page}")
        hit = [v for v in res["voices"] if v["voice_id"] == vid]
        if hit: owner = hit[0]["public_owner_id"]; name = hit[0]["name"]; break
    if not owner: print(lang, vid, "NOT FOUND"); continue
    r = api(f"/v1/voices/add/{owner}/{vid}", {"new_name": f"Bharat {lang.upper()} - {name.split(' - ')[0]}"})
    print(lang, vid, "added ->", r)
