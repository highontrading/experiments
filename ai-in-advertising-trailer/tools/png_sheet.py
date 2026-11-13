"""usage: python3 png_sheet.py OUT.jpg files... (labelled 3-col sheet of 480x270 tiles)"""
import sys, cv2, numpy as np, os
tiles = []
for f in sys.argv[2:]:
    im = cv2.imread(f); 
    if im is None: continue
    h, w = im.shape[:2]; im = im[:int(w * 9 / 16)] if h > w * 9 / 16 else im
    im = cv2.resize(im, (480, 270), interpolation=cv2.INTER_AREA)
    cv2.rectangle(im, (0, 0), (479, 20), (0, 0, 0), -1); cv2.putText(im, os.path.basename(f), (4, 15), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1); tiles.append(im)
while len(tiles) % 4: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(sys.argv[1], np.vstack([np.hstack(tiles[r:r + 4]) for r in range(0, len(tiles), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 85])
