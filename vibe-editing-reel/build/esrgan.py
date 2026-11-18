"""Real-ESRGAN general-x4v3 (SRVGGNetCompact), re-implemented so only the BSD-3 weight file is loaded.
upscale(img_uint8_HxWx3, out_w, out_h) -> uint8 at the requested size (x4 then Lanczos down)."""
import numpy as np, torch
from torch import nn
from torch.nn import functional as F
from PIL import Image

class SRVGGNetCompact(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4):
        super().__init__()
        self.upscale = upscale
        self.body = nn.ModuleList([nn.Conv2d(num_in_ch, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)])
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1)); self.body.append(nn.PReLU(num_parameters=num_feat))
        self.body.append(nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(upscale)

    def forward(self, x):
        out = x
        for m in self.body: out = m(out)
        return self.upsampler(out) + F.interpolate(x, scale_factor=self.upscale, mode='nearest')

def load(path):
    net = SRVGGNetCompact().eval(); sd = torch.load(path, map_location='cpu', weights_only=True)
    net.load_state_dict(sd.get('params', sd)); return net

@torch.no_grad()
def upscale(net, img, out_w, out_h, tile=360):
    x = torch.from_numpy(img).permute(2, 0, 1).float().div(255)[None]
    _, _, h, w = x.shape; out = torch.zeros(1, 3, h * 4, w * 4); pad = 12
    for y0 in range(0, h, tile):
        for x0 in range(0, w, tile):
            ya, yb, xa, xb = max(0, y0 - pad), min(h, y0 + tile + pad), max(0, x0 - pad), min(w, x0 + tile + pad)
            with torch.autocast('cpu', dtype=torch.bfloat16):          # AMX: ~1.7x faster, visually identical
                o = net(x[:, :, ya:yb, xa:xb]).float().clamp(0, 1)
            oy, ox = (y0 - ya) * 4, (x0 - xa) * 4; th, tw = (min(h, y0 + tile) - y0) * 4, (min(w, x0 + tile) - x0) * 4
            out[:, :, y0 * 4:y0 * 4 + th, x0 * 4:x0 * 4 + tw] = o[:, :, oy:oy + th, ox:ox + tw]
    big = Image.fromarray((out[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8))
    return np.asarray(big.resize((out_w, out_h), Image.LANCZOS))
