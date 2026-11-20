import json, numpy as np
REAL=["Entourée de mes go j'suis dans le mouv","Du Oumou Sangaré dans la gova","On est bien on est rempli de lové",
"Ce soir on nous parle pas de love","Apprêtées, plus que prêtes, on est fraîches","Ce soir t'as raté si t'es pas là",
"T'es rentré mais tes talons te blesse","Une heure deux heures te voila mal à l'aise","Déhanche toi oublie tout ça reste entre nous",
"Ce soir c'est la mala","Tu forces on avance on reste entre nous","On ne se mélange pas"]
W=json.load(open("lyrics_whisper.json"))
out=[]
for k,txt in enumerate(REAL):
    toks=[w for w in W if w["line"]==k]
    if k==11: toks=[w for w in toks if w["word"]!="oh"]
    # char->time mapping using whisper tokens
    cs=[0];ts=[toks[0]["start"]]; pos=0
    for w in toks:
        n=len(w["word"])+1
        cs+= [pos, pos+n]; ts+=[w["start"], w["end"]]; pos+=n
    cs=np.array(cs,float)/pos; ts=np.array(ts)
    order=np.argsort(cs,kind="stable"); cs,ts=cs[order],np.maximum.accumulate(ts[order])
    words=txt.replace(",","").split(); tot=sum(len(x)+1 for x in words); p=0
    for x in words:
        a=p/tot; b=(p+len(x))/tot; p+=len(x)+1
        out.append(dict(word=x,start=round(float(np.interp(a,cs,ts)),2),end=round(float(np.interp(b,cs,ts)),2),line=k))
json.dump(out,open("lyrics.json","w"),indent=1,ensure_ascii=False)
for w in out[:20]+out[-8:]: print(w)
