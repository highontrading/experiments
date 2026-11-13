import sys, cv2, numpy as np
out=sys.argv[1]; rows=[]
for spec in sys.argv[2:]:
    f=spec; cap=cv2.VideoCapture(f); fps=cap.get(5); n=int(cap.get(7)); d=n/fps; tiles=[]
    t=0.0
    while t<d-0.05 and len(tiles)<16:
        cap.set(cv2.CAP_PROP_POS_MSEC,t*1000); ok,im=cap.read()
        if ok:
            s=150/im.shape[0]; im=cv2.resize(im,(max(1,int(im.shape[1]*s)),150)); cv2.putText(im,f"{t:.0f}",(3,14),0,0.45,(0,255,255),1); tiles.append(im)
        t+=1.0 if d<=17 else d/16
    row=np.hstack(tiles); W=2000
    row=row[:,:W] if row.shape[1]>=W else cv2.copyMakeBorder(row,0,0,0,W-row.shape[1],cv2.BORDER_CONSTANT,value=(20,20,20))
    row=cv2.copyMakeBorder(row,20,2,0,0,cv2.BORDER_CONSTANT,value=(20,20,20)); cv2.putText(row,f.split('/')[-1][:40]+f" {d:.1f}s",(4,15),0,0.5,(0,255,255),1); rows.append(row)
cv2.imwrite(out,np.vstack(rows),[cv2.IMWRITE_JPEG_QUALITY,75])
