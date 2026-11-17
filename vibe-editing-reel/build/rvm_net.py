"""Robust Video Matting (MobileNetV3 variant), single-frame recurrent inference.
Re-implemented from the published RVM architecture (Lin et al., 2021) so only the weight file
is loaded from outside. Parameter names match the official checkpoint."""
import torch
from torch import nn
from torch.nn import functional as F
from torchvision.models.mobilenetv3 import MobileNetV3, InvertedResidualConfig
from torchvision.transforms.functional import normalize


class Encoder(MobileNetV3):
    def __init__(self):
        C = InvertedResidualConfig
        super().__init__(inverted_residual_setting=[
            C(16, 3, 16, 16, False, "RE", 1, 1, 1), C(16, 3, 64, 24, False, "RE", 2, 1, 1),
            C(24, 3, 72, 24, False, "RE", 1, 1, 1), C(24, 5, 72, 40, True, "RE", 2, 1, 1),
            C(40, 5, 120, 40, True, "RE", 1, 1, 1), C(40, 5, 120, 40, True, "RE", 1, 1, 1),
            C(40, 3, 240, 80, False, "HS", 2, 1, 1), C(80, 3, 200, 80, False, "HS", 1, 1, 1),
            C(80, 3, 184, 80, False, "HS", 1, 1, 1), C(80, 3, 184, 80, False, "HS", 1, 1, 1),
            C(80, 3, 480, 112, True, "HS", 1, 1, 1), C(112, 3, 672, 112, True, "HS", 1, 1, 1),
            C(112, 5, 672, 160, True, "HS", 2, 2, 1), C(160, 5, 960, 160, True, "HS", 1, 2, 1),
            C(160, 5, 960, 160, True, "HS", 1, 2, 1)], last_channel=1280)
        del self.avgpool, self.classifier

    def forward(self, x):
        x = normalize(x, [0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        f = self.features
        x = f[1](f[0](x)); f1 = x
        x = f[3](f[2](x)); f2 = x
        x = f[6](f[5](f[4](x))); f3 = x
        for i in range(7, 17): x = f[i](x)
        return f1, f2, f3, x


class LRASPP(nn.Module):
    def __init__(self, i, o):
        super().__init__()
        self.aspp1 = nn.Sequential(nn.Conv2d(i, o, 1, bias=False), nn.BatchNorm2d(o), nn.ReLU(True))
        self.aspp2 = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Conv2d(i, o, 1, bias=False), nn.Sigmoid())

    def forward(self, x): return self.aspp1(x) * self.aspp2(x)


class ConvGRU(nn.Module):
    def __init__(self, c):
        super().__init__(); self.channels = c
        self.ih = nn.Sequential(nn.Conv2d(c * 2, c * 2, 3, padding=1), nn.Sigmoid())
        self.hh = nn.Sequential(nn.Conv2d(c * 2, c, 3, padding=1), nn.Tanh())

    def forward(self, x, h):
        if h is None: h = torch.zeros_like(x)
        r, z = self.ih(torch.cat([x, h], 1)).split(self.channels, 1)
        c = self.hh(torch.cat([x, r * h], 1))
        h = (1 - z) * h + z * c
        return h, h


class Bottleneck(nn.Module):
    def __init__(self, c):
        super().__init__(); self.channels = c; self.gru = ConvGRU(c // 2)

    def forward(self, x, r):
        a, b = x.split(self.channels // 2, 1); b, r = self.gru(b, r)
        return torch.cat([a, b], 1), r


class Up(nn.Module):
    def __init__(self, i, skip, src, o):
        super().__init__(); self.out_channels = o
        self.conv = nn.Sequential(nn.Conv2d(i + skip + src, o, 3, 1, 1, bias=False), nn.BatchNorm2d(o), nn.ReLU(True))
        self.gru = ConvGRU(o // 2)

    def forward(self, x, f, s, r):
        x = F.interpolate(x, scale_factor=2, mode='bilinear', align_corners=False)[:, :, :s.size(2), :s.size(3)]
        x = self.conv(torch.cat([x, f, s], 1))
        a, b = x.split(self.out_channels // 2, 1); b, r = self.gru(b, r)
        return torch.cat([a, b], 1), r


class Out(nn.Module):
    def __init__(self, i, src, o):
        super().__init__()
        self.conv = nn.Sequential(nn.Conv2d(i + src, o, 3, 1, 1, bias=False), nn.BatchNorm2d(o), nn.ReLU(True),
                                  nn.Conv2d(o, o, 3, 1, 1, bias=False), nn.BatchNorm2d(o), nn.ReLU(True))

    def forward(self, x, s):
        x = F.interpolate(x, scale_factor=2, mode='bilinear', align_corners=False)[:, :, :s.size(2), :s.size(3)]
        return self.conv(torch.cat([x, s], 1))


class Decoder(nn.Module):
    def __init__(self, fc=(16, 24, 40, 128), dc=(80, 40, 32, 16)):
        super().__init__()
        self.decode4 = Bottleneck(fc[3])
        self.decode3 = Up(fc[3], fc[2], 3, dc[0])
        self.decode2 = Up(dc[0], fc[1], 3, dc[1])
        self.decode1 = Up(dc[1], fc[0], 3, dc[2])
        self.decode0 = Out(dc[2], 3, dc[3])

    def forward(self, s0, f1, f2, f3, f4, r1, r2, r3, r4):
        p = lambda t: F.avg_pool2d(t, 2, 2, count_include_pad=False, ceil_mode=True)
        s1 = p(s0); s2 = p(s1); s3 = p(s2)
        x4, r4 = self.decode4(f4, r4)
        x3, r3 = self.decode3(x4, f3, s3, r3)
        x2, r2 = self.decode2(x3, f2, s2, r2)
        x1, r1 = self.decode1(x2, f1, s1, r1)
        return self.decode0(x1, s0), r1, r2, r3, r4


class Projection(nn.Module):
    def __init__(self, i, o):
        super().__init__(); self.conv = nn.Conv2d(i, o, 1)

    def forward(self, x): return self.conv(x)


class Refiner(nn.Module):  # deep guided filter
    def __init__(self, hid=16):
        super().__init__()
        self.box_filter = nn.Conv2d(4, 4, 3, padding=1, bias=False, groups=4)
        self.conv = nn.Sequential(nn.Conv2d(4 * 2 + hid, hid, 1, bias=False), nn.BatchNorm2d(hid), nn.ReLU(True),
                                  nn.Conv2d(hid, hid, 1, bias=False), nn.BatchNorm2d(hid), nn.ReLU(True),
                                  nn.Conv2d(hid, 4, 1, bias=True))

    def forward(self, fine, base, fgr, pha, hid):
        fx = torch.cat([fine, fine.mean(1, keepdim=True)], 1)
        bx = torch.cat([base, base.mean(1, keepdim=True)], 1)
        by = torch.cat([fgr, pha], 1)
        mx, my = self.box_filter(bx), self.box_filter(by)
        cov = self.box_filter(bx * by) - mx * my
        var = self.box_filter(bx * bx) - mx * mx
        A = self.conv(torch.cat([cov, var, hid], 1)); b = my - A * mx
        H, W = fine.shape[2:]
        A = F.interpolate(A, (H, W), mode='bilinear', align_corners=False)
        b = F.interpolate(b, (H, W), mode='bilinear', align_corners=False)
        return (A * fx + b).split([3, 1], 1)


class RVM(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = Encoder(); self.aspp = LRASPP(960, 128); self.decoder = Decoder()
        self.project_mat = Projection(16, 4); self.project_seg = Projection(16, 1); self.refiner = Refiner()

    def forward(self, src, r1=None, r2=None, r3=None, r4=None, downsample_ratio=0.4):
        sm = F.interpolate(src, scale_factor=downsample_ratio, mode='bilinear', align_corners=False,
                           recompute_scale_factor=False)
        f1, f2, f3, f4 = self.backbone(sm)
        hid, *rec = self.decoder(sm, f1, f2, f3, self.aspp(f4), r1, r2, r3, r4)
        fres, pha = self.project_mat(hid).split([3, 1], 1)
        fres, pha = self.refiner(src, sm, fres, pha, hid)
        return (fres + src).clamp(0, 1), pha.clamp(0, 1), rec


def load(path):
    net = RVM().eval()
    net.load_state_dict(torch.load(path, map_location='cpu', weights_only=True))
    return net
