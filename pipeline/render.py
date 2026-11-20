import json, numpy as np, cv2, sys, subprocess, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=os.path.dirname(os.path.abspath(__file__))
FPS=30; W,H=1600,1090
N=len(os.listdir(f"{S}/hq"))
frames_only=[int(x) for x in sys.argv[2].split(",")] if len(sys.argv)>2 and sys.argv[2] else None
out=sys.argv[1]
L=json.load(open(f"{S}/lyrics.json"))
FONTS=[(f"{S}/fonts/anton/files/anton-latin-400-normal.woff","upper",300),
       (f"{S}/fonts/archivo-black/files/archivo-black-latin-400-normal.woff","upper",190),
       (f"{S}/fonts/fredoka/files/fredoka-latin-700-normal.woff","lower",230)]
RINGF=f"{S}/fonts/archivo-black/files/archivo-black-latin-400-normal.woff"
# word display intervals
for i,w in enumerate(L):
    nxt=L[i+1]["start"] if i+1<len(L) else w["end"]+0.6
    w["show_end"]=min(nxt, w["end"]+0.45) if nxt-w["end"]>0.45 else nxt
lines={}
for w in L: lines.setdefault(w["line"],[]).append(w)
line_span={k:(v[0]["start"],v[-1]["show_end"]) for k,v in lines.items()}

def word_sprite(i):
    w=L[i]; fp,case,size=FONTS[(i*7+w["line"])%3 if False else [0,2,1,2,0,1][i%6]]
    t=w["word"].upper() if case=="upper" else w["word"].lower()
    f=ImageFont.truetype(fp,size)
    bb=f.getbbox(t); tw,th=bb[2]-bb[0],bb[3]-bb[1]
    maxw=W*0.86; target=min(max(tw,W*0.6),maxw)
    k=min(target/tw,(H*0.42)/th)
    if abs(k-1)>0.02:
        size=int(size*k); f=ImageFont.truetype(fp,size); bb=f.getbbox(t); tw,th=bb[2]-bb[0],bb[3]-bb[1]
    pad=80
    im=Image.new("L",(tw+2*pad,th+2*pad),0); ImageDraw.Draw(im).text((pad-bb[0],pad-bb[1]),t,font=f,fill=255)
    a=np.asarray(im,np.float32)/255
    glow=np.clip(cv2.GaussianBlur(cv2.dilate(a,np.ones((9,9))),(0,0),26)*1.6,0,1)
    return a,glow
sprites={}
def ring_sprite(k,R):
    txt=("  ✦  ".join([" ".join(x["word"] for x in lines[k]).upper()]*1)+"   •   ")
    f=ImageFont.truetype(RINGF,40)
    # repeat text to fill circumference
    circ=2*math.pi*R
    unit=" ".join(x["word"] for x in lines[k]).upper()+"   •   "
    n=max(1,int(circ/ f.getlength(unit)))
    txt=unit*n
    scale=circ/f.getlength(txt)
    size=2*R+120; im=Image.new("L",(size,size),0); c=size/2
    ang=-math.pi/2
    for ch in txt:
        cw=f.getlength(ch)*scale
        a=ang+cw/2/R
        g=Image.new("L",(60,60),0); ImageDraw.Draw(g).text((30,30),ch,font=f,fill=255,anchor="mm")
        g=g.rotate(-math.degrees(a)-90,resample=Image.BICUBIC)
        x=c+R*math.cos(a)-30; y=c+R*math.sin(a)-30
        im.paste(255,(int(x),int(y)),g) if False else im.paste(Image.new("L",g.size,255),(int(x),int(y)),g)
        ang+=cw/R
    d=ImageDraw.Draw(im)
    d.ellipse((c-R-34,c-R-34,c+R+34,c+R+34),outline=255,width=2)
    d.ellipse((c-R+30,c-R+30,c+R-30,c+R-30),outline=150,width=1)
    return np.asarray(im,np.float32)/255
rings={}

# player centroid track (smoothed)
cache=f"{S}/track.npy"
if os.path.exists(cache) and len(np.load(cache))==N: tr=np.load(cache)
else:
    tr=[]
    for i in range(1,N+1):
        m=cv2.imread(f"{S}/masks/{i:05d}.png",0)
        if m is None: tr.append([np.nan]*4+[0]); continue
        ys,xs=np.nonzero(m>128)
        tr.append([xs.mean(),ys.mean(),ys.min(),ys.max(),len(xs)] if len(xs)>200 else [np.nan]*4+[0])
    tr=np.array(tr,float)
    for j in range(4):
        v=tr[:,j]; ok=~np.isnan(v); tr[:,j]=np.interp(np.arange(N),np.nonzero(ok)[0],v[ok])
    if len(os.listdir(f"{S}/masks"))>=N: np.save(cache,tr)
def smooth(v,r):
    k=np.ones(2*r+1)/(2*r+1); p=np.pad(v,r,mode="edge"); return np.convolve(p,k,"valid")
pres=smooth(np.clip((tr[:,4]-15000)/40000,0,1),15)
tr[:,0]=tr[:,0]*pres+W/2*(1-pres); tr[:,2]=tr[:,2]*pres+H*0.22*(1-pres); tr[:,3]=tr[:,3]*pres+H*0.95*(1-pres); tr[:,1]=tr[:,1]*pres+H*0.55*(1-pres)
cx=smooth(tr[:,0],20); cy=smooth(tr[:,1],20); top=smooth(tr[:,2],25); bot=smooth(tr[:,3],25)

# grade: warm, soft, creamy highlights (reference edit look)
lut=np.arange(256)/255.
def curve(x,lift,gain,gamma): return np.clip((lift+(gain-lift)*x)**gamma,0,1)
LR=(curve(lut,0.045,1.0,0.97)*255).astype(np.uint8)
LG=(curve(lut,0.035,0.985,1.0)*255).astype(np.uint8)
LB=(curve(lut,0.05,0.95,1.04)*255).astype(np.uint8)
yy,xx=np.mgrid[0:H,0:W]
vign=1-0.38*(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2)**1.3*0.6
vign=np.clip(vign,0,1)[...,None].astype(np.float32)
rng=np.random.default_rng(3)
grain_bank=[cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),0.7) for _ in range(8)]

def grade(bgr):
    b,g,r=cv2.split(bgr)
    x=cv2.merge([cv2.LUT(b,LB),cv2.LUT(g,LG),cv2.LUT(r,LR)]).astype(np.float32)/255
    # soften saturation a bit, warm tint
    gray=x.mean(2,keepdims=True); x=gray+(x-gray)*0.92
    return x
def bloom(x):
    lum=x.max(2)
    hi=np.clip((lum-0.62)/0.38,0,1)[...,None]*x
    small=cv2.resize(hi,(W//4,H//4))
    bl=cv2.GaussianBlur(small,(0,0),9); bl=cv2.resize(bl,(W,H))
    bl2=cv2.resize(cv2.GaussianBlur(small,(0,0),3),(W,H))
    bl=bl*np.array([0.85,0.95,1.15],np.float32)  # BGR -> warm halation
    return 1-(1-x)*(1-0.55*bl-0.25*bl2)

def ease(t): t=min(max(t,0),1); return 1-(1-t)**3

def alpha_paste(dst,alpha,color,x0,y0,op):
    h,w=alpha.shape; X0,Y0=max(x0,0),max(y0,0); X1,Y1=min(x0+w,W),min(y0+h,H)
    if X1<=X0 or Y1<=Y0: return
    a=alpha[Y0-y0:Y1-y0,X0-x0:X1-x0][...,None]*op
    dst[Y0:Y1,X0:X1]=dst[Y0:Y1,X0:X1]*(1-a)+np.array(color,np.float32)*a

ff=None
if not frames_only:
    ff=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
        "-i",sys.argv[3],"-map","0:v","-map","1:a","-c:v","libx264","-preset","slow","-crf","16","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","256k","-movflags","+faststart","-shortest",out],stdin=subprocess.PIPE)
for fi in (frames_only or range(1,N+1)):
    t=(fi-1)/FPS
    bgr=cv2.imread(f"{S}/hq/{fi:05d}.jpg")
    m=cv2.imread(f"{S}/masks/{fi:05d}.png",0).astype(np.float32)/255
    m=cv2.GaussianBlur(np.clip((m-0.25)/0.6,0,1),(0,0),1.2)[...,None]
    base=grade(bgr)
    # slow breathing push-in
    z=1.0+0.035*(0.5-0.5*math.cos(2*math.pi*t/12))
    M=cv2.getRotationMatrix2D((W/2,H/2),0,z)
    base=cv2.warpAffine(base,M,(W,H),borderMode=cv2.BORDER_REFLECT)
    mm=cv2.warpAffine(m,M,(W,H))[...,None]
    i=fi-1
    pcx,pcy=M@np.array([cx[i],cy[i],1]); ptop=(M@np.array([0,top[i],1]))[1]; pbot=(M@np.array([0,bot[i],1]))[1]
    ph=max(pbot-ptop,200)
    layer=base*0.86
    # soft light glow behind player (nonchalant, low intensity)
    glow_r=ph*0.75
    gl=np.exp(-(((xx-pcx)**2+(yy-(ptop+ph*0.4))**2)/(2*glow_r**2))).astype(np.float32)[...,None]
    layer=1-(1-layer)*(1-0.22*gl*np.array([0.75,0.88,1.0],np.float32))
    # current line ring
    cur_line=None
    for k,(s,e) in line_span.items():
        if s-0.25<=t<=e+0.35: cur_line=k
    if cur_line is not None:
        s,e=line_span[cur_line]
        R=int(np.clip(ph*0.52,260,470)//10*10)
        key=(cur_line,R)
        if key not in rings: rings[key]=ring_sprite(cur_line,R)
        rs=rings[key]; sz=rs.shape[0]
        op=min(ease((t-(s-0.25))/0.5), ease((e+0.35-t)/0.4))
        sc=0.9+0.1*ease((t-(s-0.25))/0.6)
        ang=-t*14+cur_line*40
        Mr=cv2.getRotationMatrix2D((sz/2,sz/2),ang,sc)
        r2=cv2.warpAffine(rs,Mr,(sz,sz))
        ccy=ptop+ph*0.42
        alpha_paste(layer,r2,(1,1,1),int(pcx-sz/2),int(ccy-sz/2),0.9*op)
    # current word
    for wi,w in enumerate(L):
        if w["start"]-0.03<=t<w["show_end"]:
            if wi not in sprites: sprites[wi]=word_sprite(wi)
            a,g=sprites[wi]
            p=ease((t-w["start"]+0.03)/0.18)
            sc=1.12-0.12*p
            out_fade=ease((w["show_end"]-t)/0.08)
            if sc!=1.0:
                a=cv2.resize(a,None,fx=sc,fy=sc); g=cv2.resize(g,None,fx=sc,fy=sc)
            h,ww=a.shape
            x=int(np.clip(pcx,min(ww/2+30,W/2),max(W-ww/2-30,W/2))-ww/2); y=int(ptop+ph*0.24-h/2)
            y=int(np.clip(y,-40,H-h+40))
            alpha_paste(layer,g,(0.04,0.03,0.03),x,y+10,0.6*p*out_fade)
            alpha_paste(layer,a,(0.97,0.98,1.0),x,y,p*out_fade)
            break
    # put player in front
    comp=layer*(1-mm)+base*mm
    comp=bloom(comp)
    comp=comp*vign
    comp=comp+grain_bank[fi%8][...,None]*0.022
    o=(np.clip(comp,0,1)*255).astype(np.uint8)
    if frames_only: cv2.imwrite(f"{out}_{fi}.jpg",o)
    else:
        ff.stdin.write(o.tobytes())
        if fi%100==0: print(fi,flush=True)
if ff: ff.stdin.close(); ff.wait()
