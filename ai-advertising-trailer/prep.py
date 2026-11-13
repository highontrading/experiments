"""Prepare picture assets from build/src -> assets/img (stills) and build/clips (video frame sequences).
Sources: build/src/circles_sq (tools/circle_crop.py), build/src/history, build/src/oldworld (tools/fetch_cc0.py,
CC0/public domain via Openverse, credits in each credits.jsonl), build/src/site (Ideabro course page assets)."""
import os, subprocess, json
from PIL import Image

SITE = "build/src/site/"
def site(name): return SITE + name

# hook: circles in strobe order (media circles -> spirals -> hurricanes -> earth)
HOOK = ["lens_aperture_0", "lens_aperture_1", "ring_light_0", "eye_iris_macro_1", "ring_light_1", "film_reel_1",
        "vinyl_record_2", "clock_face_0", "drum_top_1", "compact_disc_2", "eye_iris_macro_2", "round_window_0",
        "stage_spotlight_2", "ring_light_2", "clock_face_1", "drum_top_2", "vinyl_record_0", "round_window_1",
        "telescope_1", "round_window_2", "lens_aperture_2", "spiral_staircase_from_above_1", "telescope_2",
        "telescope_0", "hurricane_satellite_0", "hurricane_satellite_2", "hurricane_satellite_1",
        "blue_marble_earth_2", "blue_marble_earth_0"]

STILLS = {  # name -> (source, max side)
    "print_a": ("build/src/history/1920s_magazine_advertisement_2.jpg", 1400),
    "print_b": ("build/src/history/1920s_magazine_advertisement_0.jpg", 1400),
    "radio": ("build/src/history/vintage_radio_microphone_2.jpg", 1400),
    "tv": ("build/src/history/1950s_television_set_0.jpg", 1400),
    "ow_cinecam": ("build/src/oldworld/cinema_camera_1.jpg", 1000),
    "ow_clapper": ("build/src/oldworld/clapperboard_1.jpg", 1000),
    "ow_tripod": ("build/src/oldworld/film_camera_on_tripod_0.jpg", 1000),
    "ow_photog": ("build/src/oldworld/film_camera_on_tripod_2.jpg", 1000),
    "ow_polaroid": ("build/src/oldworld/polaroid_photos_1.jpg", 1000),
    "ow_lens": ("build/src/history/camera_lens_1.jpg", 1000),
    "ow_shooter": ("build/src/history/camera_lens_2.jpg", 1000),
    # our studio work (Ideabro course page)
    "shoe_product": (site("1794506362294-a2b906e9-6e0e-4cde-840e-6d266ad4dd43.png"), 1200),
    "shoe_1": (site("1794506357509-d72f4319-3bf4-44cf-86c6-ff3f6fffc042.png"), 1100),
    "shoe_2": (site("1794506362294-020ace08-fb23-4af1-864f-182d735895ad.png"), 1100),
    "shoe_3": (site("1794506362294-477df062-cffc-4947-82b5-c412e308c4ce.png"), 1100),
    "shoe_4": (site("1794506362294-6ecd3200-e2ce-4c68-91a7-70f59f25a2eb.png"), 1100),
    "shoe_5": (site("1794506362294-e137718f-be92-4f74-9730-bad8d3bd752f.png"), 1100),
    "juice_1": (site("1794511688353-733f7543-4b39-4746-9d3d-49300b68f5f8.png"), 1100),
    "juice_2": (site("1794511688354-352edaae-6af8-4035-affe-a0804789a49a.png"), 1100),
    "juice_3": (site("1794511688354-0217e01a-4bbb-4ec4-85a1-f635c50508cd.png"), 1100),
    "look_1": (site("1786712172986-ab3d6881-dd10-485e-af97-0ff59f5aefea.png"), 1100),
    "look_2": (site("1786712172990-0c97b808-87a1-4b48-8df3-08a0bf5b6f51.png"), 1100),
    "look_3": (site("1786712172991-3a0e7bd9-8d55-44ff-8aed-293f53205af5.png"), 1100),
}

# proof montage: clip id -> (file, source start s, seconds to extract)
CLIPS = {
    "v10": ("1794509925138-a71bf361-4baf-4364-9e68-a22641059a18.mp4", 4.3, 1.7),
    "v13": ("1794509925138-fb291663-4730-49f2-b5ae-4cee07e984f0.mp4", 1.8, 1.7),
    "v4":  ("1794508092579-ed567e77-2579-4bc1-8f9b-a647c9b35c96.mp4", 4.0, 1.7),
    "v5":  ("1794508092579-f94c080e-d211-4639-97de-cfcd24b6ee18.mp4", 2.6, 1.0),
    "v12": ("1794509925138-f0aa8d87-6007-46e9-a721-8d7b93f400ef.mp4", 8.5, 1.0),
    "v1":  ("1787676947564-696f183a-4219-4348-b9bb-eb7e07ec8b45.mp4", 7.0, 1.0),
    "v0":  ("1787676934751-6aa3814d-05b7-42ec-9e29-e3c0d8ff8b86.mp4", 11.5, 1.0),
    "v11": ("1794509925138-af27720d-5b41-42e7-b5fa-284e5cd2c945.mp4", 1.0, 1.0),
    "v8":  ("1794509925138-60702112-1c81-45d2-945c-14e3a9508fba.mp4", 1.8, 1.0),
    "v7":  ("1794509925138-2c3c8d2e-1480-4ac8-b44e-021dce3e9ab7.mp4", 2.2, 1.1),
}

def save(src, dst, side):
    im = Image.open(src).convert("RGB"); im.thumbnail((side, side), Image.LANCZOS); im.save(dst, quality=88)

if __name__ == "__main__":
    os.makedirs("assets/img/hook", exist_ok=True)
    for i, n in enumerate(HOOK):
        save(f"build/src/circles_sq/{n}.jpg", f"assets/img/hook/h{i:02d}.jpg", 900)
    for n, (src, side) in STILLS.items():
        save(src, f"assets/img/{n}.jpg", side)
    meta = {}
    for cid, (f, ss, dur) in CLIPS.items():
        d = f"build/clips/{cid}"; os.makedirs(d, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-i", SITE + f, "-t", str(dur), "-vf",
                        "fps=30,scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'", "-q:v", "3",
                        f"{d}/f%04d.jpg"], check=True)
        n = len(os.listdir(d)); w, h = Image.open(f"{d}/f0001.jpg").size
        meta[cid] = {"n": n, "w": w, "h": h}
    json.dump({"hook": len(HOOK), "clips": meta}, open("build/assets.json", "w"), indent=1)
    print(json.dumps(meta))
