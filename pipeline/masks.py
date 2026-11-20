import onnxruntime as ort, numpy as np, sys, glob, cv2, os
from ultralytics import YOLO
S=sys.argv[1]; start=int(sys.argv[2]) if len(sys.argv)>2 else 1
sess=ort.InferenceSession(f"{S}/models/model.onnx",providers=["CPUExecutionProvider"])
yolo=YOLO(f"{S}/models/yolo11s-seg.pt")
files=sorted(glob.glob(f"{S}/hq/*.jpg"))
prev_gate=None; prev=None; prev_c=None
K=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(61,61))
for f in files:
    idx=int(os.path.basename(f)[:5])
    im=cv2.imread(f); H,W=im.shape[:2]
    rgb=cv2.cvtColor(im,cv2.COLOR_BGR2RGB)
    x=cv2.resize(rgb,(1024,1024)).astype(np.float32)/255.-0.5
    o=sess.run(None,{"input":x.transpose(2,0,1)[None]})[0][0,0]
    o=(o-o.min())/(o.max()-o.min()+1e-6); o=cv2.resize(o,(W,H))
    r=yolo.predict(im,imgsz=960,conf=0.2,classes=[0,32],verbose=False,retina_masks=True)[0]
    gate=np.zeros((H,W),np.uint8)
    if r.masks is not None:
        ms=r.masks.data.cpu().numpy(); cl=r.boxes.cls.cpu().numpy().astype(int); bx=r.boxes.xyxy.cpu().numpy()
        persons=[i for i in range(len(cl)) if cl[i]==0]
        if persons:
            # choose largest person (or closest to previous centroid)
            def score(i):
                a=ms[i].sum()
                if prev_c is None: return a
                cy,cx=np.argwhere(ms[i]>0.5).mean(0); return a/ (1+np.hypot(cx-prev_c[1],cy-prev_c[0])/200)
            p=max(persons,key=score)
            pm=(ms[p]>0.5).astype(np.uint8); prev_c=np.argwhere(pm>0).mean(0)
            gate|=pm
            pb=bx[p]
            for i in range(len(cl)):
                if cl[i]==32:
                    b=bx[i]; cx,cy=(b[0]+b[2])/2,(b[1]+b[3])/2
                    # balls near the player
                    if pb[0]-200<cx<pb[2]+200 and pb[1]-250<cy<pb[3]+100:
                        gate|=(ms[i]>0.5).astype(np.uint8)
                        cv2.ellipse(gate,(int(cx),int(cy)),(int((b[2]-b[0])/2)+6,int((b[3]-b[1])/2)+6),0,0,360,1,-1)
    if gate.sum()<500 and prev_gate is not None: gate=prev_gate
    prev_gate=gate
    g=cv2.dilate(gate,K); g=cv2.GaussianBlur(g.astype(np.float32),(0,0),12); g=np.clip(g*1.5,0,1)
    # combine: rmbg detail inside gate, but ensure yolo core is kept
    m=np.maximum(o*g, cv2.GaussianBlur(gate.astype(np.float32),(0,0),3)*0.85)
    if prev is not None: m=0.65*m+0.35*prev
    prev=m
    cv2.imwrite(f"{S}/masks/{idx:05d}.png",(np.clip(m,0,1)*255).astype(np.uint8))
    if idx%50==0: print(idx,flush=True)
