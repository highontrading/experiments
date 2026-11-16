"""Video frame sequences per ad: name -> (source, in-point s, duration s, max width px).
Sources: build/drive/* (Ideabro Drive folder, AI-made footage), mixkit:<id> (Mixkit Free License)."""
D = "build/drive/"
V = "build/drive2/v_"
SEQS = {
  "a01": {"studio": ("mixkit:50639", 1.0, 9.0, 1080)},
  "a03": {"m1": (D + "f1_influencer_vlog.mp4", 2.0, 3.0, 640), "m2": (D + "f2_NaKN.mp4", 3.0, 3.0, 640),
          "m3": (D + "f1_IC1N.mp4", 1.0, 3.0, 640), "m4": (D + "f1_HCgB.mp4", 4.0, 3.0, 640)},
  "a05": {"city": ("mixkit:49878", 0.5, 6.5, 1080), "laptop": ("mixkit:17450", 0.5, 5.5, 1080),
          "live": (D + "f1_9E0I.mp4", 3.0, 6.0, 720)},
  "a06": {"cheetah": (D + "f1_9E0I.mp4", 2.0, 3.2, 1080), "car": (D + "f1_7bYb.mp4", 4.0, 3.0, 1080), "moto": (D + "f1_pY4a.mp4", 5.0, 3.0, 1080),
          "leopard": (D + "f1_EmM3.mp4", 3.0, 3.0, 1080), "sea": (D + "f2_8R2a.mp4", 3.0, 3.0, 1080), "zep": (D + "f1_F3kR.mp4", 4.0, 3.0, 1080),
          "bts": ("mixkit:29467", 1.0, 3.0, 1080)},
  "a07": {"hero": ("build/src/site/1794509925138-fb291663-4730-49f2-b5ae-4cee07e984f0.mp4", 1.0, 4.5, 1080)},
  "a09": {"car": (D + "f1_7bYb.mp4", 6.0, 3.0, 640), "ugc": (D + "f1_influencer_vlog.mp4", 5.0, 3.0, 640)},
  "a10": {"diya": ("mixkit:3438", 2.0, 4.0, 1080), "hands": ("mixkit:41731", 1.0, 4.0, 1080), "flame": ("mixkit:3438", 0.5, 4.0, 1080),
          "woman": ("mixkit:50776", 1.0, 4.0, 1080)},
  "a11": {},
  "a12": {"kitchen": (D + "f1_influencer_vlog.mp4", 1.0, 4.2, 1080), "sandwich": (D + "f2_NaKN.mp4", 2.0, 4.2, 1080), "gym": (D + "f1_HCgB.mp4", 3.0, 4.2, 1080),
          "beach": (D + "f1_IC1N.mp4", 0.5, 4.2, 1080), "garden": (D + "f1_UA1z.mp4", 2.0, 4.2, 1080)},
  "a13": {"stress": ("mixkit:45922", 0.5, 4.5, 1080), "frust": ("mixkit:25575", 0.5, 4.5, 1080), "calm": ("mixkit:43259", 0.5, 4.5, 1080)},
  "a18": {"w0": (D + "f1_9E0I.mp4", 2.5, 2.5, 1080), "w1": (D + "f1_pY4a.mp4", 5.0, 2.5, 1080), "w2": (D + "f1_EmM3.mp4", 3.5, 2.5, 1080),
          "w3": (D + "f2_FCHv.mp4", 6.0, 2.5, 1080), "w4": (D + "f2_drYw.mp4", 4.0, 2.5, 1080), "m1": (D + "f1_7bYb.mp4", 8.0, 1.5, 1080),
          "m2": (D + "f2_8R2a.mp4", 6.0, 1.5, 1080), "m3": (D + "f1_uoJa.mp4", 2.0, 1.5, 1080), "m4": (D + "f2_aJ7I.mp4", 8.0, 1.5, 1080)},
  # ---------------- round 2 ----------------
  "b01": {"beach": (D + "f1_IC1N.mp4", 5.2, 2.2, 1080), "cafe": (D + "f1_BAkaZ.mp4", 11.8, 2.2, 1080), "cheetah": (D + "f1_9E0I.mp4", 0.3, 2.2, 1080), "tree": (D + "f1_9E0I.mp4", 4.4, 2.2, 1080),
          "pond": (D + "f1_uoJa.mp4", 4.6, 2.2, 1080), "cam": (D + "f1_F3kR.mp4", 12.3, 2.2, 1080), "fish": (D + "f2_8R2a.mp4", 11.6, 2.2, 1080),
          "ferris": (D + "f2_5zq.mp4", 7.2, 2.2, 1080), "desert": (D + "f1_IC1N.mp4", 7.6, 2.2, 1080)},
  "b02": {"eye4k": (D + "f1_EmM3.mp4", 0.2, 0.2, 3840)},
  "b03": {"haze3": (D + "f1_uoJa.mp4", 4.6, 3.0, 1080), "back": (D + "f1_IC1N.mp4", 12.2, 3.0, 1080), "gold2": (D + "f1_IC1N.mp4", 7.3, 3.0, 1080),
          "intro": (D + "f2_5zq.mp4", 7.0, 3.6, 1080)},
  "b05": {"intro": (D + "f1_F3kR.mp4", 4.6, 3.4, 1080), "action": (D + "f2_8R2a.mp4", 2.4, 2.4, 1080), "phone": (D + "f1_IC1N.mp4", 0.0, 2.4, 1080),
          "drone": (D + "f1_BAkaZ.mp4", 4.4, 2.6, 1080), "film": (D + "f1_F3kR.mp4", 10.2, 3.0, 1080), "out": (D + "f1_9E0I.mp4", 4.0, 3.0, 1080)},
  "b09": {"market": ("mixkit:983", 1.0, 2.0, 1080), "tea": ("mixkit:100252", 1.0, 3.4, 1080)},
  "b13": {"desk": ("mixkit:44073", 1.0, 2.6, 1080), "edit": ("mixkit:44075", 1.0, 3.0, 1080)},
  "b14": {"real1": ("mixkit:33553", 1.0, 3.0, 1080), "beach": (D + "f1_IC1N.mp4", 2.4, 3.0, 1080), "real2": ("mixkit:41617", 1.0, 3.0, 1080)},
  "b16": {"studio": ("mixkit:50639", 1.0, 2.2, 1080), "product": ("mixkit:44119", 1.0, 2.2, 1080), "set": ("mixkit:44069", 1.0, 2.2, 1080),
          "cafe": (D + "f1_BAkaZ.mp4", 11.8, 2.2, 1080), "beach": (D + "f1_IC1N.mp4", 5.2, 2.2, 1080), "cheetah": (D + "f1_9E0I.mp4", 4.0, 2.4, 1080)},
  "b17": {"ugc": (D + "f1_influencer_vlog.mp4", 1.0, 2.2, 1080), "car4": (D + "f1_7bYb.mp4", 0.2, 2.2, 1080)},
  "b20": {"storm": (D + "f2_utOs.mp4", 1.0, 2.6, 1080), "zep": (D + "f2_FCHv.mp4", 0.2, 3.2, 1080), "tree": (D + "f1_9E0I.mp4", 4.6, 3.0, 1080),
          "window": (D + "f1_uoJa.mp4", 13.6, 3.0, 1080), "sea": (D + "f2_8R2a.mp4", 0.2, 2.4, 1080), "leopard": (D + "f1_EmM3.mp4", 4.0, 2.8, 1080),
          "earth": (D + "f1_BAkaZ.mp4", 0.0, 3.0, 1080)},
  # ---------------- round 3 ----------------
  "c01": {"storm": (D + "f2_utOs.mp4", 1.0, 2.6, 1080), "zep": (D + "f2_FCHv.mp4", 0.2, 2.6, 1080), "car": (D + "f1_7bYb.mp4", 4.0, 2.0, 1080),
          "boom": (D + "f1_7bYb.mp4", 12.3, 2.0, 1080), "leopard": (D + "f1_EmM3.mp4", 4.0, 2.0, 1080), "run": (D + "f1_9E0I.mp4", 6.2, 2.4, 1080),
          "sea": (D + "f2_8R2a.mp4", 0.2, 2.0, 1080), "earth": (D + "f1_BAkaZ.mp4", 0.0, 2.6, 1080), "cafe": (D + "f1_BAkaZ.mp4", 11.8, 2.0, 1080),
          "beach": (D + "f1_IC1N.mp4", 5.2, 2.0, 1080), "dinner": (D + "f2_AXNq.mp4", 3.0, 2.0, 1080), "desert": (D + "f1_IC1N.mp4", 7.3, 2.4, 1080)},
  "c02": {"studio": ("mixkit:50639", 1.0, 3.6, 1080), "cafe": (D + "f1_BAkaZ.mp4", 11.8, 3.0, 1080), "beach": (D + "f1_IC1N.mp4", 5.2, 3.2, 1080),
          "car": (D + "f1_7bYb.mp4", 0.2, 3.0, 1080), "tree": (D + "f1_9E0I.mp4", 4.4, 3.0, 1080)},
  "c06": {"studio": ("mixkit:50639", 1.0, 3.0, 1080), "crew": ("mixkit:44069", 1.0, 3.0, 1080)},
  "c08": {"tree": (D + "f1_9E0I.mp4", 4.4, 3.0, 1080), "beach": (D + "f1_IC1N.mp4", 5.2, 3.0, 1080), "cafe": (D + "f1_BAkaZ.mp4", 11.8, 3.0, 1080),
          "leopard": (D + "f1_EmM3.mp4", 4.0, 3.0, 1080)},
  "c09": {"studio": ("mixkit:50639", 1.0, 3.0, 1080), "product": ("mixkit:44119", 1.0, 3.0, 1080), "set": ("mixkit:44069", 1.0, 3.0, 1080),
          "cafe": (D + "f1_BAkaZ.mp4", 11.8, 3.0, 1080), "beach": (D + "f1_IC1N.mp4", 5.2, 3.0, 1080), "tree": (D + "f1_9E0I.mp4", 4.4, 3.0, 1080)},
  "c12": {"laptop": ("mixkit:17450", 0.5, 4.0, 1080), "stress": ("mixkit:45922", 0.5, 4.0, 1080), "window": (D + "f1_uoJa.mp4", 14.3, 2.0, 1080),
          "pond": (D + "f1_uoJa.mp4", 4.6, 3.6, 1080)},
  "c13": {"dubai": (D + "f1_IC1N.mp4", 5.2, 2.4, 1080), "nyc": (D + "f1_BAkaZ.mp4", 9.0, 2.6, 1080), "home": ("mixkit:17450", 0.5, 3.0, 1080)},
  "c14": {"ugc2": (D + "f1_influencer_vlog.mp4", 7.0, 4.5, 1080)},
  "c18": {"beach": (D + "f1_IC1N.mp4", 5.2, 2.2, 1080), "cafe": (D + "f1_BAkaZ.mp4", 11.8, 2.2, 1080), "ugc": (D + "f1_influencer_vlog.mp4", 1.0, 2.2, 1080),
          "tree": (D + "f1_9E0I.mp4", 4.4, 2.2, 1080)},
  "c19": {"pond": (D + "f1_uoJa.mp4", 4.6, 4.0, 1080), "sea": (D + "f2_8R2a.mp4", 0.2, 3.6, 1080), "tree": (D + "f1_9E0I.mp4", 4.4, 4.0, 1080),
          "sunset": (D + "f2_5zq.mp4", 7.0, 4.0, 1080), "earth": (D + "f1_BAkaZ.mp4", 0.0, 4.0, 1080)},
  "c05": {"studio": ("mixkit:50639", 1.0, 2.0, 1080), "crew": ("mixkit:44069", 1.0, 2.0, 1080), "product": ("mixkit:44119", 1.0, 2.0, 1080), "laptop": ("mixkit:17450", 0.5, 2.0, 1080)},
  "c11": {"desk": ("mixkit:44073", 1.0, 0.1, 1080)},
  # ---------------- trailers ----------------
  "t01": {"earth": (D + "f1_BAkaZ.mp4", 0.0, 2.8, 1280), "tube": (V + "130rvH.mp4", 1.5, 2.6, 720), "bill": (V + "1vdvfn.mp4", 5.0, 2.8, 720),
          "glasses": (V + "1xlHnF.mp4", 0.5, 2.6, 720), "giant": (V + "1ydv_Z.mp4", 0.9, 2.6, 720), "legs": (V + "1Kwoch.mp4", 0.0, 1.75, 720),
          "plane": (V + "1x-XoC.mp4", 0.5, 2.6, 720), "phone": (V + "1Gw7B7.mp4", 0.5, 2.6, 720), "float": (V + "14E5un.mp4", 9.6, 2.6, 720),
          "sky": (V + "18GEeW.mp4", 0.4, 2.6, 720), "surf": (V + "1w_Txn.mp4", 0.85, 2.2, 720), "bags": (V + "1PxD-E.mp4", 2.6, 2.6, 720),
          "island": (V + "1szmPp.mp4", 0.3, 4.5, 720)},
  "t02": {"selfie": (V + "1BsdYT.mp4", 0.2, 2.9, 720), "serum": (V + "1Wa5Te.mp4", 0.6, 2.4, 720), "ootd": (V + "1aFsDp.mp4", 2.25, 2.4, 720),
          "skate": (V + "1BaEv4.mp4", 1.0, 2.4, 720), "floor": (V + "1dqz_U.mp4", 0.4, 2.4, 720), "grwm": (V + "1IGLwN.mp4", 8.7, 1.0, 720),
          "unbox": (V + "1szmPp.mp4", 10.1, 2.4, 720), "bridge": (V + "1YB5F_.mp4", 3.8, 1.65, 720), "skin": (V + "1UopOJ.mp4", 3.9, 1.7, 720),
          "walk": (V + "1I-0BN.mp4", 1.7, 2.4, 720), "fit": (V + "17Ag_X.mp4", 0.4, 3.0, 720)},
  "t03": {"drop": (V + "1T1uNB.mp4", 0.1, 3.0, 720), "lime": (V + "1slEr9.mp4", 4.9, 2.6, 720), "falls": (V + "1CGl_J.mp4", 2.8, 2.6, 720),
          "green": (V + "13dcAK.mp4", 0.8, 2.6, 720), "pull": (V + "1YB5F_.mp4", 5.5, 1.1, 720), "dropper": (V + "1UopOJ.mp4", 1.3, 1.6, 720),
          "belt": (V + "1x-XoC.mp4", 7.6, 2.6, 720), "bus": (V + "12JUja.mp4", 5.0, 2.6, 720), "beach": (V + "1w_Txn.mp4", 5.8, 2.6, 720),
          "snow": (V + "1HzLk7.mp4", 14.6, 2.6, 720), "latte": (V + "1PMhya.mp4", 4.8, 2.0, 720)},
  "t04": {"soho": (V + "1QBHTD.mp4", 12.8, 2.6, 720), "box": (V + "1NKFhu.mp4", 10.6, 2.6, 720), "office": (V + "1ACHGA.mp4", 0.2, 2.6, 720),
          "car": (V + "1BB6W5.mp4", 3.0, 2.6, 720), "sky2": (V + "1YB5F_.mp4", 10.8, 1.9, 720), "city": (V + "1Kwoch.mp4", 6.7, 2.4, 720),
          "golden": (D + "f1_F3kR.mp4", 10.2, 2.6, 1280), "beach": (D + "f1_IC1N.mp4", 5.2, 2.6, 1280), "train": (V + "17Ag_X.mp4", 3.0, 4.0, 720)},
  "t05": {"crew": ("mixkit:44069", 1.0, 3.0, 1080), "storm": (D + "f2_utOs.mp4", 1.0, 2.4, 1080), "zep": (D + "f2_FCHv.mp4", 0.2, 2.4, 1080),
          "leopard": (D + "f1_EmM3.mp4", 3.0, 2.4, 1280), "tree": (D + "f1_9E0I.mp4", 4.4, 2.4, 1280), "sea": (D + "f2_8R2a.mp4", 0.2, 2.4, 1080),
          "car": (D + "f1_7bYb.mp4", 0.2, 2.0, 1280), "pond": (D + "f1_uoJa.mp4", 4.6, 2.4, 1080), "sky": (V + "18GEeW.mp4", 3.0, 2.4, 720),
          "earth": (D + "f1_BAkaZ.mp4", 0.0, 3.0, 1280), "sunset": (D + "f2_5zq.mp4", 7.0, 2.4, 1080), "desert": (D + "f1_IC1N.mp4", 7.3, 2.4, 1280),
          "moto": (D + "f1_pY4a.mp4", 5.0, 2.4, 1280), "window": (D + "f1_uoJa.mp4", 14.3, 2.4, 1080)},
}
# Meta ads cut from the trailers reuse the trailer clip specs
for _m, _t, _ks in [("m01", "t01", ["tube", "giant", "plane", "phone", "surf", "island"]), ("m02", "t02", ["selfie", "serum", "ootd", "skin", "walk", "fit"]),
                    ("m03", "t03", ["drop", "lime", "falls", "belt", "beach", "latte"]), ("m04", "t04", ["soho", "office", "car", "sky2", "golden", "train"]),
                    ("m05", "t05", ["storm", "window", "leopard", "tree", "sunset", "earth"])]:
    SEQS[_m] = {k: SEQS[_t][k] for k in _ks}

# ---------------- round 5: clip catalog (name -> (src, in, dur, maxw)) ----------------
SR = "build/screenrec/site.mp4"
CAT = {
 "ny_walk": (V+"1QBHTD.mp4", 2.9, 2.2, 720), "ny_bag": (V+"1QBHTD.mp4", 6.4, 1.6, 720), "ny_glasses": (V+"1QBHTD.mp4", 32.5, 1.8, 720), "ny_car": (V+"1QBHTD.mp4", 25.3, 1.8, 720),
 "ny_cross": (V+"1QBHTD.mp4", 29.5, 1.8, 720), "ny_close": (V+"1QBHTD.mp4", 33.4, 1.8, 720), "ny_strut": (V+"1QBHTD.mp4", 12.8, 2.4, 720),
 "nk_box": (V+"1NKFhu.mp4", 10.6, 2.4, 720), "nk_pink": (V+"1NKFhu.mp4", 24.0, 1.8, 720), "nk_heels": (V+"1NKFhu.mp4", 15.4, 2.0, 720), "nk_walk": (V+"1NKFhu.mp4", 28.2, 2.2, 720),
 "ootd_flat": (V+"1aFsDp.mp4", 2.25, 1.4, 720), "ootd_paper": (V+"1aFsDp.mp4", 2.85, 1.6, 720),
 "ugc_hi": (V+"1BsdYT.mp4", 0.2, 2.8, 720), "ugc_hands": (V+"1BsdYT.mp4", 3.0, 1.3, 720), "ugc_drink": (V+"1BsdYT.mp4", 8.1, 2.0, 720), "ugc_hair": (V+"1BsdYT.mp4", 14.9, 2.4, 720),
 "ugc_glow": (V+"1BsdYT.mp4", 23.2, 1.7, 720), "ugc2_talk": (V+"1Wa5Te.mp4", 0.6, 2.6, 720), "ugc2_face": (V+"1Wa5Te.mp4", 6.8, 2.4, 720),
 "island": (V+"1szmPp.mp4", 0.3, 3.0, 720), "suitcase": (V+"1szmPp.mp4", 10.1, 2.6, 720), "plane": (V+"1x-XoC.mp4", 0.5, 2.6, 720), "belt": (V+"1x-XoC.mp4", 7.6, 2.4, 720),
 "clouds": (V+"1x-XoC.mp4", 13.0, 2.6, 720), "falls": (V+"1CGl_J.mp4", 2.8, 2.6, 720), "luna": (V+"1slEr9.mp4", 4.9, 2.6, 720), "luna_lime": (V+"1slEr9.mp4", 8.0, 2.0, 720),
 "times": (V+"1vdvfn.mp4", 5.0, 2.6, 720), "london": (V+"130rvH.mp4", 1.5, 2.6, 720), "sky_girl": (V+"14E5un.mp4", 9.6, 2.4, 720), "sky_phone": (V+"14E5un.mp4", 15.0, 2.4, 720),
 "fly": (V+"18GEeW.mp4", 0.4, 2.4, 720), "fly_blue": (V+"18GEeW.mp4", 3.6, 2.4, 720), "boots": (V+"1PxD-E.mp4", 2.6, 2.4, 720), "phone_store": (V+"1Gw7B7.mp4", 0.5, 2.6, 720),
 "glasses": (V+"1xlHnF.mp4", 0.5, 2.4, 720), "giant_girl": (V+"1ydv_Z.mp4", 0.9, 2.4, 720), "ny2": (V+"1I-0BN.mp4", 1.7, 2.4, 720), "ny2_close": (V+"1I-0BN.mp4", 6.5, 1.6, 720),
 "train": (V+"17Ag_X.mp4", 0.4, 3.0, 720), "office": (V+"1ACHGA.mp4", 0.2, 2.6, 720), "carwin": (V+"1BB6W5.mp4", 3.0, 2.6, 720), "carwin_run": (V+"1BB6W5.mp4", 10.9, 1.2, 720),
 "skate": (V+"1BaEv4.mp4", 1.0, 2.4, 720), "floor": (V+"1dqz_U.mp4", 0.4, 2.4, 720), "can_drop": (V+"1T1uNB.mp4", 0.1, 2.6, 720), "can_spin": (V+"1T1uNB.mp4", 8.1, 2.4, 720),
 "berry": (V+"13dcAK.mp4", 0.8, 2.6, 720), "city_girl": (V+"1YB5F_.mp4", 0.0, 1.7, 720), "bridge": (V+"1YB5F_.mp4", 3.8, 1.6, 720), "pull": (V+"1YB5F_.mp4", 5.5, 0.7, 720),
 "skyline": (V+"1YB5F_.mp4", 10.8, 1.9, 720), "epica_clock": (V+"12JUja.mp4", 0.0, 1.5, 720), "epica_bus": (V+"12JUja.mp4", 5.0, 2.4, 720), "epica_frames": (V+"12JUja.mp4", 12.1, 2.4, 720),
 "drop": (V+"1UopOJ.mp4", 1.3, 1.6, 720), "faces": (V+"1UopOJ.mp4", 3.9, 1.7, 720), "smile": (V+"1UopOJ.mp4", 10.8, 1.6, 720), "giant_legs": (V+"1Kwoch.mp4", 0.0, 1.75, 720),
 "giant_city": (V+"1Kwoch.mp4", 1.85, 1.9, 720), "surf": (V+"1w_Txn.mp4", 0.85, 2.2, 720), "beachcan": (V+"1w_Txn.mp4", 5.8, 2.4, 720), "tennis": (V+"1H8NnI.mp4", 1.5, 1.9, 720),
 "grwm_glasses": (V+"1IGLwN.mp4", 11.8, 1.0, 720), "grwm_tea": (V+"1IGLwN.mp4", 3.0, 0.8, 720), "bottles": (V+"1-HSrV.mp4", 0.5, 2.4, 720),
 "cheetah": (D+"f1_9E0I.mp4", 0.3, 2.4, 1280), "tree": (D+"f1_9E0I.mp4", 4.4, 2.4, 1280), "leopard": (D+"f1_EmM3.mp4", 3.0, 2.4, 1280), "beach": (D+"f1_IC1N.mp4", 5.2, 2.4, 1280),
 "desert": (D+"f1_IC1N.mp4", 7.3, 2.4, 1280), "backlit": (D+"f1_IC1N.mp4", 12.2, 2.4, 1280), "cafe": (D+"f1_BAkaZ.mp4", 11.8, 2.4, 1280), "earth": (D+"f1_BAkaZ.mp4", 0.0, 3.0, 1280),
 "nyc": (D+"f1_BAkaZ.mp4", 9.0, 2.4, 1280), "pond": (D+"f1_uoJa.mp4", 4.6, 2.4, 1080), "aquarium": (D+"f1_uoJa.mp4", 14.3, 2.4, 1080), "sea": (D+"f2_8R2a.mp4", 0.2, 2.4, 1080),
 "storm": (D+"f2_utOs.mp4", 1.0, 2.6, 1080), "zep": (D+"f2_FCHv.mp4", 0.2, 2.6, 1080), "car": (D+"f1_7bYb.mp4", 0.2, 2.2, 1280), "sunset": (D+"f2_5zq.mp4", 7.0, 2.4, 1080),
 "moto": (D+"f1_pY4a.mp4", 5.0, 2.4, 1280), "golden": (D+"f1_F3kR.mp4", 10.2, 2.4, 1280), "vlog": (D+"f1_influencer_vlog.mp4", 1.0, 2.6, 1080), "garden": (D+"f1_UA1z.mp4", 2.0, 2.4, 1080),
 "studio": ("mixkit:50639", 1.0, 3.0, 1080), "crew": ("mixkit:44069", 1.0, 3.0, 1080), "prodshoot": ("mixkit:44119", 1.0, 3.0, 1080), "laptop": ("mixkit:17450", 0.5, 3.0, 1080),
 "stress": ("mixkit:45922", 0.5, 3.0, 1080), "desk": ("mixkit:44073", 1.0, 3.0, 1080), "edit": ("mixkit:44075", 1.0, 3.0, 1080),
 "site": (SR, 3.0, 6.0, 1080), "site2": (SR, 4.2, 4.0, 1080),
}
def use(ad, names):
    SEQS[ad] = {n: CAT[n] for n in names}
use("r01", ["storm", "ny_strut", "can_spin", "luna", "ugc_hi", "cheetah", "belt", "falls", "surf", "plane"])
use("r02", ["studio", "prodshoot", "crew", "luna", "berry", "ugc2_talk", "ugc_drink", "faces", "zep", "leopard", "aquarium", "office", "ny_walk", "giant_girl", "site"])
use("r03", ["laptop", "studio", "sky_girl", "luna_lime", "faces", "can_drop", "ugc_hands", "moto", "stress", "epica_bus", "beachcan", "ny_cross"])
use("r04", ["laptop", "skate", "ny2_close", "berry", "ugc2_face", "cheetah", "golden", "nk_walk", "fly", "island", "glasses", "clouds", "carwin"])
use("r05", ["ugc2_talk", "ny_cross", "ugc_hi", "storm", "can_drop", "drop", "site", "vlog", "giant_legs", "phone_store", "boots", "plane", "surf", "tennis", "bottles", "skyline"])
use("r06", ["ny_glasses", "berry", "faces", "carwin", "ugc_hair", "tree", "office", "train", "backlit", "ny_car"])
use("r07", ["crew", "nk_pink", "glasses", "smile", "ugc_hands", "ny_bag", "sky_phone", "backlit", "aquarium", "luna", "zep", "sunset", "site", "fly", "leopard", "island", "car", "earth"])
use("r08", ["ny_close", "luna_lime", "berry", "bottles", "can_spin", "nk_box", "glasses", "ugc_glow", "belt", "moto", "london", "giant_girl", "ny2", "falls", "beach", "giant_city", "phone_store", "surf", "faces"])
use("r09", ["surf", "falls", "ny_strut", "studio", "carwin_run", "can_drop", "sky_girl", "clouds", "boots", "fly_blue", "smile", "nk_heels", "city_girl", "tennis"])
use("r10", ["sunset", "prodshoot", "backlit", "cafe", "giant_city", "beachcan", "desert", "pull", "island", "nyc", "garden", "moto", "sea", "skate"])
