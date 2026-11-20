import json, numpy as np, cv2, sys, subprocess, math, os
from PIL import Image, ImageDraw, ImageFont
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); V=f"{S}/v2"
FPS=30; W,H=1080,1586; N=1131
out=sys.argv[1]
frames_only=[int(x) for x in sys.argv[2].split(",")] if len(sys.argv)>2 and sys.argv[2] else None
SRC=sys.argv[3] if len(sys.argv)>3 else None
FR=sys.argv[4] if len(sys.argv)>4 else "sr"
FONT=f"{S}/fonts/bodoni-moda/files/bodoni-moda-latin-500-normal.woff"
L=json.load(open(f"{S}/lyrics.json"))
BEHIND={1,4,6,9}
for i,w in enumerate(L):
    nxt=L[i+1]["start"] if i+1<len(L) else w["end"]+0.8
    w["show_end"]=nxt if nxt-w["end"]<=0.6 else w["end"]+0.6
# chunks: <=3 words and <=15 chars, within a line
chunks=[]; cur=[]
for i,w in enumerate(L):
    if cur and (L[cur[0]]["line"]!=w["line"] or len(cur)>=3 or len(" ".join(L[j]["word"] for j in cur+[i]))>15):
        chunks.append(cur); cur=[]
    cur.append(i)
chunks.append(cur)
word_chunk={}
for ci,c in enumerate(chunks):
    for j in c: word_chunk[j]=ci
# light/dark alternation per word (like the reference strobe), deterministic
rng=np.random.default_rng(11); tone=[]; tcur=1
for i in range(len(L)):
    if i==0 or rng.random()<0.6: tcur=1-tcur
    tone.append(tcur)  # 1=light frame/black text, 0=dark frame/white text

def spaced(t,f,track):
    x=0; pos=[]
    for ch in t: pos.append(x); x+=f.getlength(ch)+track
    return pos, x-track
cache={}
def text_sprite(text,size):
    key=(text,size)
    if key in cache: return cache[key]
    f=ImageFont.truetype(FONT,size); track=size*0.07
    pos,tw=spaced(text,f,track); asc,desc=f.getmetrics(); pad=60
    im=Image.new("L",(int(tw)+2*pad,asc+desc+2*pad),0); d=ImageDraw.Draw(im)
    for ch,x in zip(text,pos): d.text((pad+x,pad),ch,font=f,fill=255)
    a=np.asarray(im,np.float32)/255
    a=cv2.resize(a,(int(a.shape[1]*0.8),a.shape[0]),interpolation=cv2.INTER_AREA)  # condensed look
    cache[key]=a; return a
def fit_size(text,maxw,base):
    s=base
    while s>40:
        if text_sprite(text,s).shape[1]-96<=maxw: return s
        s=int(s*0.93)
    return s
# distress textures (scratches + specks)
def distress(seed):
    r=np.random.default_rng(seed); m=np.zeros((H,W),np.float32)
    for _ in range(260):
        x,y=r.integers(0,W),r.integers(0,H); l=r.integers(4,40); a=r.uniform(-1.2,1.2)
        cv2.line(m,(int(x),int(y)),(int(x+l*math.cos(a)),int(y+l*math.sin(a))),1.0,int(r.integers(1,3)))
    sp=(r.random((H,W))<0.004).astype(np.float32); sp=cv2.dilate(sp,np.ones((2,2)))
    return np.clip(m+sp,0,1)
DIS=[distress(s) for s in range(4)]

lut=np.arange(256)/255.
def curve(x,lift,gain,gamma): return np.clip((lift+(gain-lift)*x)**gamma,0,1)
LR=(curve(lut,0.03,1.0,0.96)*255).astype(np.uint8); LG=(curve(lut,0.02,0.99,0.99)*255).astype(np.uint8); LB=(curve(lut,0.035,0.96,1.03)*255).astype(np.uint8)
yy,xx=np.mgrid[0:H,0:W]
rr=(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2)
vign=np.clip(1-0.30*rr**1.4,0,1)[...,None].astype(np.float32)
vign_strong=np.clip(1-0.75*np.clip(rr-0.25,0,None)**1.0,0,1)[...,None].astype(np.float32)
grain=[cv2.GaussianBlur(np.random.default_rng(s).normal(0,1,(H,W)).astype(np.float32),(0,0),0.8) for s in range(6)]
def grade(bgr):
    b,g,r=cv2.split(bgr); x=cv2.merge([cv2.LUT(b,LB),cv2.LUT(g,LG),cv2.LUT(r,LR)]).astype(np.float32)/255
    return np.clip((x-0.5)*1.05+0.5,0,1)
def bloom(x,amt=0.4):
    hi=np.clip((x.max(2)-0.6)/0.4,0,1)[...,None]*x; sm=cv2.resize(hi,(W//4,H//4))
    bl=cv2.resize(cv2.GaussianBlur(sm,(0,0),10),(W,H))*np.array([0.85,0.95,1.12],np.float32)
    return 1-(1-x)*(1-amt*bl)
def ease(t): t=min(max(t,0),1); return 1-(1-t)**3
def paste(dst,alpha,color,x0,y0,op):
    h,w=alpha.shape; X0,Y0=max(x0,0),max(y0,0); X1,Y1=min(x0+w,W),min(y0+h,H)
    if X1<=X0 or Y1<=Y0: return
    a=alpha[Y0-y0:Y1-y0,X0-x0:X1-x0][...,None]*op
    dst[Y0:Y1,X0:X1]=dst[Y0:Y1,X0:X1]*(1-a)+np.array(color,np.float32)*a

# player track (for behind lines)
tc=f"{V}/track.npy"
if os.path.exists(tc): tr=np.load(tc)
else:
    tr=[]
    for i in range(1,N+1):
        m=cv2.imread(f"{V}/masks/{i:05d}.png",0)
        if m is None: tr.append([np.nan]*4+[0]); continue
        ys,xs=np.nonzero(m>128)
        tr.append([xs.mean(),ys.mean(),ys.min(),ys.max(),len(xs)] if len(xs)>300 else [np.nan]*4+[0])
    tr=np.array(tr,float)
    for j in range(4):
        v=tr[:,j]; ok=~np.isnan(v); tr[:,j]=np.interp(np.arange(N),np.nonzero(ok)[0],v[ok]) if ok.any() else W/2
    if len(os.listdir(f"{V}/masks"))>=N: np.save(tc,tr)
def smooth(v,r): k=np.ones(2*r+1)/(2*r+1); return np.convolve(np.pad(v,r,mode="edge"),k,"valid")
top=smooth(tr[:,2],22)

ff=None
if not frames_only:
    ff=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
        "-i",SRC,"-map","0:v","-map","1:a","-c:v","libx264","-preset","slow","-crf","17","-tune","film","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","256k","-movflags","+faststart","-shortest",out],stdin=subprocess.PIPE)
grng=np.random.default_rng(5)
for fi in (frames_only or range(1,N+1)):
    t=(fi-1)/FPS; i=fi-1
    bgr=cv2.imread(f"{V}/{FR}/{fi:05d}."+("png" if FR=="sr" else "jpg"))
    base=grade(bgr)
    cw=None
    for wi,w in enumerate(L):
        if w["start"]-0.02<=t<w["show_end"]: cw=wi; break
    if cw is None:
        comp=bloom(base)*vign
    else:
        ci=word_chunk[cw]; ch=chunks[ci]; vis=[j for j in ch if j<=cw]
        text=" ".join(L[j]["word"] for j in vis).upper()
        full=" ".join(L[j]["word"] for j in ch).upper()
        line=L[cw]["line"]; behind=line in BEHIND
        light=tone[cw]==1
        dt=t-L[cw]["start"]
        # veil: light (white frame) or dark (black frame), video stays visible
        if light: bg=base*0.42+0.58*np.array([0.97,0.97,0.96],np.float32); bg=bg*vign_strong*1.0+ (1-vign_strong)*0.08
        else: bg=base*0.58*vign_strong
        mw=W*(0.94 if behind else 0.86); b1,b2=(380,420) if behind else (250,310)
        size=fit_size(full if len(vis)>1 else text, mw, b1 if len(vis)>1 else b2)
        size=min(size, fit_size(text,mw,b2))
        if behind: size=fit_size(text,mw,b2)
        a=text_sprite(text,size)
        dis=DIS[(fi//2)%4]
        h,ww=a.shape
        cx0=W//2; cy0=int(np.clip(top[i]+160,H*0.3,H*0.55)) if behind else H//2
        x=cx0-ww//2; y=cy0-h//2
        fg=(0.03,0.03,0.04) if light else (0.97,0.97,0.96)
        comp=bg.copy()
        # ghost echo: big faded copy drifting
        gs=1.75+0.08*ease(dt/0.6)
        g=cv2.resize(a,None,fx=gs,fy=gs); g=cv2.GaussianBlur(g,(0,0),2.5)
        gh,gw=g.shape; drift=int(40*math.sin(t*0.9))
        paste(comp,g,fg,cx0-gw//2+drift,cy0-gh//2,0.16*ease(dt/0.15+0.3))
        p=0.45+0.55*ease(dt/0.1); sc=1.04-0.04*ease(dt/0.12)
        aa=a if sc==1 else cv2.resize(a,None,fx=sc,fy=sc)
        hh,w2=aa.shape
        dcrop=dis[0:hh,0:w2] if hh<=H and w2<=W else 0
        aa=aa*(1-0.85*dcrop)
        if not light: paste(comp,cv2.GaussianBlur(aa,(0,0),10),(0,0,0),cx0-w2//2,cy0-hh//2+6,0.5*p)
        paste(comp,aa,fg,cx0-w2//2,cy0-hh//2,p)
        # tiny glitch blocks on new word
        if dt<0.12:
            for _ in range(3):
                bw,bh=int(grng.integers(20,90)),int(grng.integers(5,12)); bx=int(cx0+grng.integers(-ww//2,ww//2)); by=int(cy0+grng.choice([-1,1])*grng.integers(h//2,h//2+120))
                comp[max(by,0):by+bh,max(bx,0):bx+bw]=0.55 if light else 0.6
        if behind:
            m=cv2.imread(f"{V}/masks/{fi:05d}.png",0)
            m=cv2.GaussianBlur(np.clip((m.astype(np.float32)/255-0.25)/0.6,0,1),(0,0),1.5)[...,None]
            comp=comp*(1-m)+bg*m
        # small punch on new word
        z=1+0.025*(1-ease(dt/0.2))
        if z>1.0005: comp=cv2.warpAffine(comp,cv2.getRotationMatrix2D((W/2,H/2),0,z),(W,H),borderMode=cv2.BORDER_REFLECT)
    comp=comp+grain[fi%6][...,None]*0.02
    o=(np.clip(comp,0,1)*255).astype(np.uint8)
    if frames_only: cv2.imwrite(f"{out}_{fi}.jpg",o)
    else:
        ff.stdin.write(o.tobytes())
        if fi%100==0: print(fi,flush=True)
if ff: ff.stdin.close(); ff.wait()
