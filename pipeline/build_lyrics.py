import json,re
W=json.load(open("words.json"))
# merge split tokens ("J" + "'vous", "Déhage" + "-toi")
toks=[]
for w in W:
    t=w["w"]
    if toks and (t.startswith("'") or t.startswith("-")) : toks[-1]["w"]+=t; toks[-1]["e"]=w["e"]
    elif toks and toks[-1]["w"] in ("J","T","t","d","c","l"): toks[-1]["w"]+=t; toks[-1]["e"]=w["e"]
    else: toks.append(dict(w=t,s=w["s"],e=w["e"]))
fix={"Entouré":"Entourée","gosses":"gos","l'mouvre":"l'mood","Déhage-toi":"Déhanche-toi","puisque":"parce que","près":"nous","d'on":"on","garé":"garée","fraîche":"fraîches","rentré":"rentrée"}
lines_break=["J'vous","On","Ce","Arrêtez","T'es","Une","Déhage-toi","Tu"]
out=[];line=0
for i,t in enumerate(toks):
    w=t["w"].strip(",.!?")
    if i>0 and t["w"][0].isupper() and w not in ("J'suis",): line+=1
    out.append(dict(word=fix.get(w,w),start=round(t["s"],2),end=round(t["e"],2),line=line))
json.dump(out,open("lyrics.json","w"),indent=1,ensure_ascii=False)
from itertools import groupby
for k,g in groupby(out,key=lambda d:d["line"]): print(k," ".join(d["word"] for d in g))
