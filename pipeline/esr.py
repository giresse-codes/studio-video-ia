import torch, torch.nn as nn, torch.nn.functional as F, numpy as np, cv2, sys, glob, os, time
class SRVGG(nn.Module):
    def __init__(s,nf=64,nc=32,up=4):
        super().__init__(); s.up=up
        b=[nn.Conv2d(3,nf,3,1,1),nn.PReLU(nf)]
        for _ in range(nc): b+=[nn.Conv2d(nf,nf,3,1,1),nn.PReLU(nf)]
        b+=[nn.Conv2d(nf,3*up*up,3,1,1)]; s.body=nn.ModuleList(b); s.ps=nn.PixelShuffle(up)
    def forward(s,x):
        o=x
        for l in s.body: o=l(o)
        return s.ps(o)+F.interpolate(x,scale_factor=s.up,mode="nearest")
S=sys.argv[1]; torch.set_num_threads(int(sys.argv[4]) if len(sys.argv)>4 else 4)
m=SRVGG(); sd=torch.load(f"{S}/models/realesr-general-x4v3.pth",map_location="cpu"); m.load_state_dict(sd.get("params",sd)); m.eval()
files=sorted(glob.glob(f"{S}/v2/src/*.png"))[int(sys.argv[2]):int(sys.argv[3])]
os.makedirs(f"{S}/v2/sr",exist_ok=True)
for f in files:
    o=f"{S}/v2/sr/"+os.path.basename(f)[:5]+".png"
    if os.path.exists(o): continue
    t=time.time()
    im=cv2.imread(f)[:,:,::-1].astype(np.float32)/255
    x=torch.from_numpy(im.transpose(2,0,1).copy())[None]
    with torch.inference_mode(): y=m(x)[0].clamp(0,1).numpy().transpose(1,2,0)[:,:,::-1]
    y=cv2.resize(y,(1080,1586),interpolation=cv2.INTER_AREA)
    cv2.imwrite(o,(y*255+0.5).astype(np.uint8))
    print(os.path.basename(f),round(time.time()-t,2),flush=True)
