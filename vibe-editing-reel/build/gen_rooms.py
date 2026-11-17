"""Generate the fake rooms (empty, eye-level, warm tungsten) on CPU with SSD-1B + LCM-LoRA.
usage: python3 gen_rooms.py OUT_DIR [name ...]"""
import sys, os, time, torch
from diffusers import StableDiffusionXLPipeline, LCMScheduler
torch.set_num_threads(4)
out = sys.argv[1]; only = set(sys.argv[2:]); os.makedirs(out, exist_ok=True)
SEEDS = [int(s) for s in os.environ.get("SEEDS", "11").split(",")]; STEPS = int(os.environ.get("STEPS", "4"))
STYLE = ("photograph, empty room, no people, eye level view from standing height, straight-on, "
         "warm tungsten lamp light, deep brown shadows, amber highlights, cinematic moody interior, "
         "shot on 35mm, shallow depth of field, soft background, film grain, editorial interior design")
ROOMS = {
    'curtain': "floor-to-ceiling amber linen curtains glowing from warm backlight, a tall fiddle leaf fig plant on the right, dark wooden floor",
    'wall':    "dark brown venetian plaster wall, a wooden door frame on the right, a small brass wall sconce glowing, dim warm light",
    'living':  "cozy living room, open doorway in the center with warm light behind, glowing mushroom table lamp, brown boucle sofa, knit throw blanket, persian rug",
    'study':   "intimate study with curved arched plaster walls, framed landscape painting lit by a brass picture light, bookshelves with vinyl records, glowing table lamp",
    'lounge':  "dark wood paneled lounge, leather armchair, large potted plant, warm glowing floor lamp, framed painting, record player on a cabinet",
}
NEG = "people, person, man, woman, face, text, watermark, logo, cartoon, illustration, blurry artifacts, distorted"
pipe = StableDiffusionXLPipeline.from_pretrained('segmind/SSD-1B', variant='fp16', torch_dtype=torch.float16)
pipe = pipe.to(torch.float32)
pipe.load_lora_weights('latent-consistency/lcm-lora-ssd-1b'); pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
for name, desc in ROOMS.items():
    if only and name not in only: continue
    for seed in SEEDS:
        t = time.time()
        g = torch.Generator().manual_seed(seed)
        img = pipe(prompt=f"{desc}, {STYLE}", negative_prompt=NEG, num_inference_steps=STEPS, guidance_scale=1.5,
                   width=576, height=1024, generator=g).images[0]
        img.save(f'{out}/{name}_{seed}.png'); print(name, seed, round(time.time() - t), 's', flush=True)
