"""Generate the fake rooms (empty, eye-level, warm tungsten) on CPU with SSD-1B + LCM-LoRA.
usage: python3 gen_rooms.py OUT_DIR [name ...]"""
import sys, os, time, torch
from diffusers import StableDiffusionXLPipeline, LCMScheduler
torch.set_num_threads(4)
out = sys.argv[1]; only = set(sys.argv[2:]); os.makedirs(out, exist_ok=True)
SEEDS = [int(s) for s in os.environ.get("SEEDS", "11").split(",")]; STEPS = int(os.environ.get("STEPS", "4"))
MOOD = "dark moody interior at night, warm amber tungsten lamplight, deep brown shadows, cinematic photograph, empty room"
ROOMS = {
    'curtain': "closed floor-to-ceiling amber linen curtains glowing softly, small brass floor lamp at the side, dark wood",
    'wall':    "dark brown textured plaster wall, wooden door on the right, small brass wall sconce glowing",
    'living':  "cozy living room, dim doorway behind, glowing mushroom table lamp on the right, brown boucle sofa corner",
    'study':   "study with arched plaster walls, framed landscape painting with brass picture light, bookshelf, table lamp",
    'lounge':  "wood paneled lounge, leather armchair on the side, glowing floor lamp, framed painting, plant in the corner",
}
NEG = "daylight, window, bright, people, person, man, woman, face, text, watermark, logo, cartoon, illustration, blurry artifacts, distorted"
pipe = StableDiffusionXLPipeline.from_pretrained('segmind/SSD-1B', variant='fp16', torch_dtype=torch.float16)
pipe = pipe.to(torch.float32)
pipe.load_lora_weights('latent-consistency/lcm-lora-ssd-1b'); pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
for name, desc in ROOMS.items():
    if only and name not in only: continue
    for seed in SEEDS:
        t = time.time()
        g = torch.Generator().manual_seed(seed)
        img = pipe(prompt=f"{MOOD}, {desc}", negative_prompt=NEG, num_inference_steps=STEPS, guidance_scale=1.5,
                   width=576, height=1024, generator=g).images[0]
        img.save(f'{out}/{name}_{seed}.png'); print(name, seed, round(time.time() - t), 's', flush=True)
