"""Video frame sequences per ad: name -> (source, in-point s, duration s, max width px).
Sources: build/drive/* (Ideabro Drive folder, AI-made footage), mixkit:<id> (Mixkit Free License)."""
D = "build/drive/"
SEQS = {
  "a01": {"studio": ("mixkit:50639", 1.0, 9.0, 1080)},
  "a03": {"m1": (D + "f1_influencer_vlog.mp4", 2.0, 3.0, 640), "m2": (D + "f2_NaKN.mp4", 3.0, 3.0, 640),
          "m3": (D + "f1_IC1N.mp4", 1.0, 3.0, 640), "m4": (D + "f1_HCgB.mp4", 4.0, 3.0, 640)},
  "a05": {"city": ("mixkit:49878", 0.5, 6.5, 1080), "laptop": ("mixkit:17450", 0.5, 5.5, 1080),
          "live": (D + "f1_9E0I.mp4", 3.0, 6.0, 720)},
  "a06": {"cheetah": (D + "f1_9E0I.mp4", 2.0, 3.2, 1080), "car": (D + "f1_7bYb.mp4", 4.0, 3.0, 1080), "moto": (D + "f1_pY4a.mp4", 5.0, 3.0, 1080),
          "leopard": (D + "f1_EmM3.mp4", 3.0, 3.0, 1080), "sea": (D + "f2_8R2a.mp4", 3.0, 3.0, 1080), "zep": (D + "f2_FCHv.mp4", 5.0, 3.0, 1080),
          "bts": ("mixkit:29467", 1.0, 3.0, 1080)},
  "a07": {"hero": (D + "f2_xcpc.mp4", 2.0, 4.5, 1080)},
  "a09": {"car": (D + "f1_7bYb.mp4", 6.0, 3.0, 640), "ugc": (D + "f1_influencer_vlog.mp4", 5.0, 3.0, 640)},
  "a10": {"diya": ("mixkit:38507", 0.5, 4.0, 1080), "hands": ("mixkit:41731", 1.0, 4.0, 1080), "flame": ("mixkit:3438", 0.5, 4.0, 1080),
          "woman": ("mixkit:50776", 1.0, 4.0, 1080)},
  "a11": {},
  "a12": {"kitchen": (D + "f1_influencer_vlog.mp4", 1.0, 4.2, 1080), "sandwich": (D + "f2_NaKN.mp4", 2.0, 4.2, 1080), "gym": (D + "f1_HCgB.mp4", 3.0, 4.2, 1080),
          "beach": (D + "f1_IC1N.mp4", 0.5, 4.2, 1080), "garden": (D + "f1_UA1z.mp4", 2.0, 4.2, 1080)},
  "a13": {"stress": ("mixkit:45922", 0.5, 4.5, 1080), "frust": ("mixkit:25575", 0.5, 4.5, 1080), "calm": ("mixkit:43259", 0.5, 4.5, 1080)},
  "a18": {"w0": (D + "f1_9E0I.mp4", 2.5, 2.5, 1080), "w1": (D + "f1_pY4a.mp4", 5.0, 2.5, 1080), "w2": (D + "f1_EmM3.mp4", 3.5, 2.5, 1080),
          "w3": (D + "f2_FCHv.mp4", 6.0, 2.5, 1080), "w4": (D + "f2_drYw.mp4", 4.0, 2.5, 1080), "m1": (D + "f1_7bYb.mp4", 8.0, 1.5, 1080),
          "m2": (D + "f2_8R2a.mp4", 6.0, 1.5, 1080), "m3": (D + "f1_uoJa.mp4", 2.0, 1.5, 1080), "m4": (D + "f2_aJ7I.mp4", 8.0, 1.5, 1080)},
}
