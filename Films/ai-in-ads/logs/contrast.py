import subprocess, sys
def region(img, x, y, w, h):
    raw = subprocess.run(['ffmpeg','-v','error','-i',img,'-vf',f'crop={w}:{h}:{x}:{y}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    px = [raw[i:i+3] for i in range(0, len(raw), 3)]
    lin = lambda v: (v/255/12.92) if v/255 <= 0.03928 else ((v/255+0.055)/1.055)**2.4
    L = sorted(0.2126*lin(p[0])+0.7152*lin(p[1])+0.0722*lin(p[2]) for p in px)
    n = len(L); dark = sum(L[:n//5])/(n//5); bright = sum(L[-n//20:])/(n//20)
    return (bright+0.05)/(dark+0.05)
for img, name, box in [('review/stills-4/000166.jpg','counter 1,341',(60,40,330,110)), ('review/stills-4/000166.jpg','versions of one advert',(60,120,330,40)),
                       ('review/stills-4/001440.jpg','REFRAIN',(300,95,340,50))]:
    x, y, w, h = box
    print(f'{name}: letters vs plaque {region(img, x, y, w, h):.1f}:1')
