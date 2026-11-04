# Pub GIRESSE #002 (sans voix off, sur la musique fournie) : python3 hyperframes/giresse-002/generer.py
# Écrit index.html et les scènes (compositions/), copie la musique, génère deux bruitages (ffmpeg),
# et copie GSAP, les polices et le logo dans assets/.
import os, shutil, subprocess

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", ".."))
COMPO = os.path.join(ICI, "compositions")
ASSETS = os.path.join(ICI, "assets")
NUMERO = "+237 673 236 084"
EMAIL = "giressepablo17@gmail.com"

# Scènes : (id, fichier, début, durée), calées sur la musique (public/audio/giresse-002-musique.wav) :
# intro calme jusqu'à 1,86 s, coups forts à 1,86 / 7,5 / 12 s, montée vers le drop à 18,9 s.
SCENES = [
    ("s1", "s1-projet", 0.0, 1.86),
    ("s3", "s3-swipez", 1.86, 1.04),
    ("s4", "s4-endroit", 2.9, 1.6),
    ("s4b", "s4b-message", 4.5, 3.0),
    ("s5", "s5-giresse", 7.5, 1.5),
    ("s6", "s6-aide", 9.0, 3.0),
    ("s7", "s7-pubs", 12.0, 1.14),
    ("s8", "s8-affiches", 13.14, 1.67),
    ("s9", "s9-sites", 14.81, 2.16),
    ("s10", "s10-applis", 16.97, 1.93),
    ("s11", "s11-contact", 18.9, 6.1),
]
DUREE = 25.0

POLICES = """		@font-face {
			font-family: 'Kit Poppins';
			font-weight: 800;
			src: url('assets/kit/fonts/poppins-800.woff2') format('woff2');
		}
		@font-face {
			font-family: 'Kit Inter';
			font-weight: 800;
			src: url('assets/kit/fonts/inter-800.woff2') format('woff2');
		}
		@font-face {
			font-family: 'Kit Inter';
			font-weight: 700;
			src: url('assets/kit/fonts/inter-700.woff2') format('woff2');
		}
		@font-face {
			font-family: 'Kit Emoji';
			src: local('Noto Color Emoji');
		}
"""

def relief(sombre, prof=14, ombre="rgba(0, 0, 0, 0.35)"):
    """Texte en relief : une pile d'ombres pleines (l'épaisseur), puis une ombre douce portée."""
    couches = ", ".join(f"0 {i}px 0 {sombre}" for i in range(1, prof + 1))
    return f"{couches}, 0 {prof + 14}px 34px {ombre}"

def scene(n, desc, fond, html, js, css=""):
    return f"""<template>
	<style>
{POLICES}		#root {{
			position: absolute;
			inset: 0;
			overflow: hidden;
		}}
		#{n}-fond {{
			position: absolute;
			inset: 0;
			background: {fond};
		}}
		.mot {{
			position: absolute;
			left: 0;
			right: 0;
			text-align: center;
			font-family: 'Kit Poppins';
			font-weight: 800;
			line-height: 1;
			white-space: nowrap;
		}}
		.emoji {{
			position: absolute;
			font-family: 'Kit Emoji';
			line-height: 1;
		}}
{css}	</style>
	<div id="root" data-composition-id="{n}" data-width="1080" data-height="1920">
		<div id="{n}-fond"></div>
		<!-- {desc} -->
		<div id="{n}-scene" style="position: absolute; inset: 0">
{html}
		</div>
	</div>
	<script>
		(function () {{
			const tl = gsap.timeline({{paused: true}});
			// Arrivée en coup de fouet : flou de mouvement qui se dissipe sur une longue traîne.
			const fouet = (cible, t, {{dx = 0, dy = 0, echelle = 1, duree = 0.45, flou = 18}} = {{}}) =>
				tl.fromTo(cible, {{opacity: 0, x: dx, y: dy, scale: echelle, filter: `blur(${{flou}}px)`}}, {{opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration: duree, ease: 'expo.out'}}, t);
			// Sortie : accélère et se floute, plus courte que l'arrivée.
			const part = (cible, t, {{dx = 0, dy = 0, duree = 0.2}} = {{}}) =>
				tl.to(cible, {{opacity: 0, x: dx, y: dy, filter: 'blur(16px)', duration: duree, ease: 'power3.in'}}, t);

{js}
			window.__timelines = window.__timelines || {{}};
			window.__timelines['{n}'] = tl;
		}})();
	</script>
</template>
"""

P = {}

# s1 : « UN PROJET EN TÊTE ? » sur un cube de verre qui tourne, les trois services au-dessus.
P["s1-projet"] = scene("s1", "Un cube de verre qui tourne : « UN PROJET » sur une face, « EN TÊTE ? » sur l'autre ; les trois services flottent au-dessus.",
    "radial-gradient(ellipse 80% 60% at 50% 45%, #1d5f9e 0%, #0b3a66 55%, #061f38 100%)",
    """			<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; perspective: 1600px">
				<div id="s1-cube" data-layout-allow-overlap style="position: absolute; left: 240px; top: 620px; width: 600px; height: 420px; transform-style: preserve-3d">
					<div class="s1-face" style="transform: translateZ(210px)">
						<div class="mot" style="top: 120px; font-size: 118px; color: #ffffff; text-shadow: TEXTE1">UN PROJET</div>
					</div>
					<div class="s1-face" style="transform: rotateY(90deg) translateZ(390px); width: 420px; left: 90px">
						<div class="mot" style="top: 140px; font-size: 92px; color: #ffffff; text-shadow: TEXTE1">EN TÊTE ?</div>
					</div>
				</div>
			</div>
			<div id="s1-i1" class="emoji" style="left: 300px; top: 420px; font-size: 130px">🎬</div>
			<div id="s1-i2" class="emoji" style="left: 475px; top: 380px; font-size: 130px">🌐</div>
			<div id="s1-i3" class="emoji" style="left: 650px; top: 420px; font-size: 130px">📱</div>""".replace("TEXTE1", relief("#0a3157", 12)),
    """			// Image 0 : le cube est déjà là ; il tourne pour montrer « EN TÊTE ? ».
			tl.fromTo('#s1-cube', {rotationY: 18, rotationX: -8}, {rotationY: -62, rotationX: 6, duration: 1.7, ease: 'power2.inOut'}, 0);
			fouet('#s1-i1', 0.15, {dy: 80, echelle: 0.4});
			fouet('#s1-i2', 0.27, {dy: 80, echelle: 0.4});
			fouet('#s1-i3', 0.39, {dy: 80, echelle: 0.4});
			tl.to(['#s1-i1', '#s1-i2', '#s1-i3'], {y: -24, duration: 0.6, ease: 'sine.inOut', stagger: 0.1}, 0.8);
			// Coupe : tout file à gauche, flou.
			part('#s1-scene', 1.7, {dx: -420});""",
    """		.s1-face {
			position: absolute;
			left: 0;
			top: 0;
			width: 600px;
			height: 420px;
			border-radius: 40px;
			background: linear-gradient(160deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 100%);
			border: 3px solid rgba(255, 255, 255, 0.35);
			box-shadow: inset 0 0 60px rgba(124, 200, 255, 0.25);
			backface-visibility: hidden;
		}
""")

# s3 : « NE SWIPEZ PAS » qui claque sur fond rouge, l'image tremble, deux croix filent.
P["s3-swipez"] = scene("s3", "Fond rouge : « NE / SWIPEZ / PAS » claque ligne par ligne, l'image tremble, deux croix filent.",
    "radial-gradient(ellipse 80% 60% at 50% 45%, #e01a32 0%, #b30d22 60%, #7a0614 100%)",
    """			<div id="s3-bloc" style="position: absolute; inset: 0">
				<div class="mot s3-l" style="top: 560px; font-size: 200px; color: #ffffff; text-shadow: @RELIEF@">NE</div>
				<div class="mot s3-l" style="top: 780px; font-size: 168px; color: #ffffff; text-shadow: @RELIEF@">SWIPEZ</div>
				<div class="mot s3-l" style="top: 980px; font-size: 200px; color: #ffffff; text-shadow: @RELIEF@">PAS</div>
			</div>
			<div class="s3-x" style="left: 120px; top: 420px; transform: rotate(35deg)"></div>
			<div class="s3-x" style="left: 760px; top: 1250px; transform: rotate(-30deg)"></div>""".replace("@RELIEF@", relief("#7a0614", 14)),
    """			// Les trois lignes claquent, 0,1 s d'écart ; à la dernière, l'image tremble.
			tl.fromTo('.s3-l', {opacity: 0, scale: 2.2, filter: 'blur(20px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power4.out', stagger: 0.1}, 0);
			tl.to('#s3-bloc', {keyframes: [{x: -14, y: 8, duration: 0.04}, {x: 12, y: -6, duration: 0.04}, {x: -8, y: 4, duration: 0.04}, {x: 0, y: 0, duration: 0.05}]}, 0.32);
			tl.fromTo('.s3-x', {opacity: 0, scaleX: 0}, {opacity: 1, scaleX: 1, duration: 0.25, ease: 'expo.out', stagger: 0.08}, 0.2);
			part('#s3-scene', 0.85, {dy: 200});""",
    """		.s3-x {
			position: absolute;
			width: 220px;
			height: 26px;
			border-radius: 13px;
			background: #ff4d5e;
			box-shadow: 0 0 30px rgba(255, 77, 94, 0.7);
		}
""")

# s4 : « VOUS ÊTES AU BON ENDROIT » : ciel, pelouse en perspective, une épingle tombe dans la cible.
P["s4-endroit"] = scene("s4", "Ciel bleu et pelouse en perspective : « VOUS ÊTES » en relief ; une épingle tombe pile dans la cible « AU BON ENDROIT ».",
    "linear-gradient(180deg, #0f4fbf 0%, #2f7fe6 52%, #31c46b 52.1%, #1e9e52 100%)",
    """			<div class="mot" id="s4-vous" style="top: 330px; font-size: 170px; color: #ffffff; text-shadow: @RELIEF@">VOUS</div>
			<div class="mot" id="s4-etes" style="top: 520px; font-size: 170px; color: #ffffff; text-shadow: @RELIEF@">ÊTES</div>
			<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; perspective: 900px">
				<div id="s4-cible" style="position: absolute; left: 90px; top: 960px; width: 900px; height: 520px; transform: rotateX(58deg); transform-origin: 50% 0%">
					<div style="position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle, #1e9e52 0%, #1e9e52 16%, #2fbf65 16.5%, #2fbf65 34%, #1a8a47 34.5%, #1a8a47 52%, #34c96c 52.5%, #34c96c 70%, transparent 70.5%)"></div>
					<div class="mot" style="top: 60px; font-size: 96px; color: #0d5c2c; text-shadow: none">AU BON</div>
					<div class="mot" style="top: 360px; font-size: 96px; color: #0d5c2c; text-shadow: none">ENDROIT</div>
				</div>
			</div>
			<div id="s4-epingle" class="emoji" data-layout-allow-overlap style="left: 470px; top: 1090px; font-size: 150px">📍</div>""".replace("@RELIEF@", relief("#0a3a8f", 12)),
    """			fouet('#s4-vous', 0, {dy: -120});
			fouet('#s4-etes', 0.12, {dy: -120});
			tl.fromTo('#s4-cible', {opacity: 0, rotationX: 85}, {opacity: 1, rotationX: 58, duration: 0.6, ease: 'expo.out'}, 0.25);
			// L'épingle tombe pile dans la cible, s'écrase et rebondit.
			tl.fromTo('#s4-epingle', {opacity: 0, y: -900}, {opacity: 1, y: 0, duration: 0.42, ease: 'power3.in'}, 0.45);
			tl.to('#s4-epingle', {scaleY: 0.78, scaleX: 1.2, transformOrigin: '50% 100%', duration: 0.07, ease: 'power2.out'}, 0.87);
			tl.to('#s4-epingle', {scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)'}, 0.94);
			tl.fromTo('#s4-cible', {scale: 1}, {scale: 1.04, duration: 0.1, ease: 'power2.out', yoyo: true, repeat: 1}, 0.87);
			part('#s4-scene', 1.42, {dx: 420});""")

# s5 : « NOUS, C'EST » + le logo GIRESSE ; des lames de couleur filent en perspective, un laser tombe.
P["s5-giresse"] = scene("s5", "Fond violet : des lames de couleur filent en perspective, un trait cyan tombe ; « NOUS, C'EST » puis la carte du logo GIRESSE.",
    "radial-gradient(ellipse 90% 70% at 50% 40%, #5a1fd1 0%, #3b0a8f 55%, #1b0450 100%)",
    """			<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; perspective: 1200px">
				<div class="s5-lame" style="left: -120px; top: 360px; background: linear-gradient(90deg, #ff3ea5, #ff7ac6); transform: rotateY(-28deg)"></div>
				<div class="s5-lame" style="left: 520px; top: 1330px; background: linear-gradient(90deg, #ffd23f, #fff07a); transform: rotateY(24deg)"></div>
				<div class="s5-lame" style="left: -80px; top: 1460px; background: linear-gradient(90deg, #3dff9a, #b5ff6b); transform: rotateY(-20deg)"></div>
			</div>
			<div id="s5-laser" style="position: absolute; left: 860px; top: 0; width: 10px; height: 1920px; background: #3ff4ff; box-shadow: 0 0 30px #3ff4ff"></div>
			<div class="mot" id="s5-nous" style="top: 330px; font-size: 130px; color: #ffffff; text-shadow: @RELIEF@">NOUS, C'EST</div>
			<div id="s5-carte" style="position: absolute; left: 190px; top: 560px; width: 700px; height: 700px; border-radius: 60px; background: linear-gradient(170deg, #f6f4ef 0%, #e9e6df 100%); box-shadow: 0 60px 120px rgba(10, 0, 40, 0.5)">
				<img src="assets/marque/logo-complet.png" style="position: absolute; left: 115px; top: 70px; width: 470px" />
			</div>""".replace("@RELIEF@", relief("#2a0870", 12)),
    """			// Les lames filent, le trait cyan tombe ; « NOUS, C'EST » ; la carte du logo pivote et se pose.
			tl.fromTo('.s5-lame', {x: -900, filter: 'blur(20px)'}, {x: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.08}, 0);
			tl.fromTo('#s5-laser', {scaleY: 0, transformOrigin: '50% 0%'}, {scaleY: 1, duration: 0.4, ease: 'power3.out'}, 0.1);
			fouet('#s5-nous', 0.05, {dx: 300});
			tl.fromTo('#s5-carte', {opacity: 0, rotationY: -60, rotationX: 15, scale: 0.7, filter: 'blur(18px)', transformPerspective: 1400}, {opacity: 1, rotationY: 0, rotationX: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out'}, 0.35);
			tl.to('.s5-lame', {x: 120, duration: 0.9, ease: 'none'}, 0.6);
			part('#s5-scene', 1.35, {dy: -300});""",
    """		.s5-lame {
			position: absolute;
			width: 760px;
			height: 120px;
			border-radius: 12px;
			box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
		}
""")

PALE = "linear-gradient(180deg, #dfe9f3 0%, #c9d9ea 100%)"
def titre_pale(n, texte, taille=150):
    return f'<div class="mot" id="{n}-titre" style="top: 520px; font-size: {taille}px; color: #ffffff; text-shadow: {relief("#9fb4cc", 10, "rgba(60, 90, 130, 0.35)")}">{texte}</div>'

# s7 : PUBS ANIMÉES : une timeline de montage, des clips colorés, la tête de lecture.
CLIPS = [(220, 930, 220, "#2eb82e"), (460, 930, 120, "#ffd23f"), (600, 930, 260, "#3d7fd9"), (260, 1030, 300, "#ff3ea5"), (580, 1030, 180, "#9b8cff")]
P["s7-pubs"] = scene("s7", "Fond pâle : « PUBS ANIMÉES » en relief blanc ; une timeline de montage se remplit de clips, la tête de lecture la traverse ; deux badges.",
    PALE,
    titre_pale("s7", "PUBS<br />ANIMÉES", 150) + """
			<div id="s7-tete" style="position: absolute; left: 200px; top: 890px; width: 8px; height: 230px; background: #3d7fd9; box-shadow: 0 0 16px rgba(61, 127, 217, 0.6)"></div>
""" + "\n".join(f'			<div class="s7-clip" style="left: {x}px; top: {y}px; width: {w}px; background: {c}"></div>' for x, y, w, c in CLIPS) + """
			<div id="s7-b1" class="s7-badge" style="left: 170px; top: 360px">▶</div>
			<div id="s7-b2" class="s7-badge" style="left: 830px; top: 400px">✦</div>""",
    """			fouet('#s7-titre', 0, {echelle: 1.3});
			tl.fromTo('.s7-clip', {opacity: 0, scaleX: 0, transformOrigin: '0% 50%'}, {opacity: 1, scaleX: 1, duration: 0.3, ease: 'expo.out', stagger: 0.07}, 0.15);
			tl.fromTo('#s7-tete', {x: 0}, {x: 680, duration: 0.85, ease: 'none'}, 0.12);
			fouet('#s7-b1', 0.2, {echelle: 0.3});
			fouet('#s7-b2', 0.3, {echelle: 0.3});
			part('#s7-scene', 0.98, {dx: -300});""",
    """		.s7-clip {
			position: absolute;
			height: 70px;
			border-radius: 14px;
			box-shadow: 0 12px 24px rgba(60, 90, 130, 0.25);
		}
		.s7-badge {
			position: absolute;
			width: 110px;
			height: 110px;
			border-radius: 26px;
			background: linear-gradient(160deg, #1b2a4a 0%, #0d1730 100%);
			color: #8ee3ff;
			font-family: 'Kit Poppins';
			font-weight: 800;
			font-size: 56px;
			line-height: 110px;
			text-align: center;
			box-shadow: 0 20px 40px rgba(13, 23, 48, 0.35);
		}
""")

# s10 : APPLICATIONS : dégradé irisé qui bouge, un téléphone de verre.
P["s10-applis"] = scene("s10", "Dégradé irisé qui bouge ; un téléphone de verre se pose ; « APPLICATIONS » en blanc.",
    "#ffffff",
    """			<div id="s10-irise" style="position: absolute; left: -400px; top: -400px; width: 1880px; height: 2720px; background: radial-gradient(circle at 30% 30%, #00e5ff 0%, transparent 35%), radial-gradient(circle at 75% 35%, #ff4d8d 0%, transparent 35%), radial-gradient(circle at 40% 70%, #ffe600 0%, transparent 35%), radial-gradient(circle at 75% 75%, #8f00ff 0%, transparent 35%); filter: blur(60px)"></div>
			<div id="s10-tel" style="position: absolute; left: 380px; top: 700px; width: 320px; height: 600px; border-radius: 60px; background: rgba(255, 255, 255, 0.28); border: 4px solid rgba(255, 255, 255, 0.7); box-shadow: 0 50px 100px rgba(60, 0, 120, 0.3)">
				<div style="position: absolute; left: 110px; top: 26px; width: 100px; height: 28px; border-radius: 14px; background: rgba(255, 255, 255, 0.8)"></div>
			</div>
			<div class="mot" id="s10-titre" style="top: 470px; font-size: 128px; color: #ffffff; text-shadow: 0 4px 30px rgba(80, 0, 160, 0.45)">APPLICATIONS</div>""",
    """			tl.fromTo('#s10-irise', {x: 0, y: 0, rotation: 0}, {x: 180, y: -160, rotation: 18, duration: 1.3, ease: 'none'}, 0);
			fouet('#s10-titre', 0, {echelle: 1.3});
			fouet('#s10-tel', 0.15, {dy: 200, echelle: 0.8});
			part('#s10-scene', 1.76, {dy: -200});""")

# s4b : « UN MESSAGE SUFFIT » : la notification du client arrive, puis la conversation s'ouvre.
WA_ICONE = """<svg style="position: absolute; left: {x}px; top: {y}px; width: {t}px; height: {t}px" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#25D366" /><path d="M 50 18 A 32 32 0 1 1 27 73 L 17 80 L 21 67 A 32 32 0 0 1 50 18 Z" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" /><path d="M 38 34 Q 34 36 35 42 Q 38 54 50 63 Q 58 68 63 66 Q 67 64 66 60 L 60 56 Q 57 56 55 59 Q 49 56 44 49 Q 47 46 46 43 L 42 36 Q 40 33 38 34 Z" fill="#FFFFFF" /></svg>"""
def bulle(id, texte, heure, top, cote="droite", coche=True):
    if cote == "droite":
        style = f"right: 26px; top: {top}px; background: #1f6f5c; border-radius: 26px 6px 26px 26px"
    else:
        style = f"left: 26px; top: {top}px; background: #2a2f35; border-radius: 6px 26px 26px 26px"
    c = f'<span class="coche" id="{id}-coche">✓✓</span>' if coche else ""
    return f'<div id="{id}" class="bulle" style="{style}">{texte}<span class="heure">{heure} {c}</span></div>'
TEL_CHAT = """			<div id="{p}-tel" style="position: absolute; left: {x}px; top: {y}px; width: {w}px; height: {h}px; border-radius: 64px; background: #0e0e12; box-shadow: 0 60px 120px rgba(0, 0, 0, 0.55), inset 0 0 0 3px rgba(255, 255, 255, 0.1)">
				<div class="ecran-chat" style="position: absolute; inset: 14px; border-radius: 52px; overflow: hidden">
					<div style="position: absolute; left: 0; right: 0; top: 0; height: 130px; background: #1c2227"></div>
					<div style="position: absolute; left: 30px; top: 50px; width: 64px; height: 64px; border-radius: 32px; background: linear-gradient(160deg, #3a3a3f, #2b2b2f); color: #e9e6df; font-family: 'Kit Poppins'; font-weight: 800; font-size: 34px; line-height: 64px; text-align: center">G</div>
					<div style="position: absolute; left: 112px; top: 50px; font-family: 'Kit Inter'; font-weight: 800; font-size: 30px; color: #e9edef">GIRESSE Digital Studio</div>
					<div style="position: absolute; left: 112px; top: 88px; font-family: 'Kit Inter'; font-weight: 700; font-size: 24px; color: #8696a0">en ligne</div>
{contenu}
				</div>
			</div>"""
CSS_CHAT = """		.ecran-chat {
			background: radial-gradient(circle at 30% 20%, #18242b 0%, #0b141a 70%);
		}
		.bulle {
			position: absolute;
			max-width: 78%;
			padding: 20px 26px 16px;
			font-family: 'Kit Inter';
			font-weight: 700;
			font-size: 32px;
			line-height: 1.25;
			color: #e9edef;
			box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
		}
		.bulle .heure {
			display: block;
			margin-top: 6px;
			text-align: right;
			font-size: 22px;
			font-weight: 700;
			color: #9fb7b0;
		}
		.bulle .coche {
			color: #9fb7b0;
		}
"""
P["s4b-message"] = scene("s4b", "Fond sombre : « UN MESSAGE SUFFIT. » ; sur le téléphone, la notification d'un client tombe, puis la conversation : « J'aurais besoin d'un site web pour mon entreprise ? », « Êtes-vous disponible ? », lu.",
    "radial-gradient(ellipse 80% 60% at 50% 55%, #1d2a30 0%, #0b1014 75%)",
    """			<div class="mot" id="s4b-l1" style="top: 230px; font-size: 104px; color: #ffffff; text-shadow: @RELIEF@">UN MESSAGE</div>
			<div class="mot" id="s4b-l2" style="top: 350px; font-size: 104px; color: #25d366; text-shadow: @RELIEF@">SUFFIT.</div>
""".replace("@RELIEF@", relief("#06231a", 10)) + TEL_CHAT.format(p="s4b", x=270, y=500, w=540, h=820, contenu="\n".join([
        "					" + bulle("s4b-b1", "J'aurais besoin d'un site web pour mon entreprise ?", "20:59", 380),
        "					" + bulle("s4b-b2", "Êtes-vous disponible ?", "20:59", 580),
        """					<div id="s4b-ecrit" class="bulle" style="left: 26px; top: 720px; background: #2a2f35; border-radius: 6px 26px 26px 26px; font-size: 40px; padding: 10px 26px 16px">• • •</div>"""])) + """
			<div id="s4b-notif" data-layout-allow-overlap style="position: absolute; left: 150px; top: 520px; width: 780px; height: 170px; border-radius: 40px; background: #efe2da; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4)">
				""" + WA_ICONE.format(x=30, y=40, t=90) + """
				<div style="position: absolute; left: 145px; top: 30px; font-family: 'Kit Inter'; font-weight: 800; font-size: 32px; color: #3b2a22">Client · maintenant</div>
				<div style="position: absolute; left: 145px; top: 78px; width: 600px; font-family: 'Kit Inter'; font-weight: 700; font-size: 30px; line-height: 1.2; color: #5a463c">J'aurais besoin d'un site web pour mon entreprise ?</div>
			</div>""",
    """			// Le téléphone ; la notification du client tombe du haut.
			fouet('#s4b-tel', 0, {dy: 160, echelle: 0.92, duree: 0.6});
			tl.fromTo('#s4b-notif', {opacity: 0, y: -260, filter: 'blur(10px)'}, {opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}, 0.2);
			fouet('#s4b-l1', 0.35, {echelle: 1.2, flou: 14});
			// La notification remonte, la conversation s'ouvre : les deux messages, puis lus (coches bleues), puis « … ».
			tl.to('#s4b-notif', {opacity: 0, y: -200, filter: 'blur(10px)', duration: 0.25, ease: 'power3.in'}, 1.0);
			fouet('#s4b-b1', 1.1, {dy: 40, echelle: 0.9, duree: 0.4, flou: 8});
			fouet('#s4b-b2', 1.55, {dy: 40, echelle: 0.9, duree: 0.4, flou: 8});
			fouet('#s4b-l2', 1.6, {echelle: 1.4, flou: 16});
			tl.to(['#s4b-b1-coche', '#s4b-b2-coche'], {color: '#53bdeb', duration: 0.1}, 2.1);
			fouet('#s4b-ecrit', 2.25, {dy: 30, echelle: 0.8, duree: 0.3, flou: 6});
			part('#s4b-scene', 2.82, {dy: -260});""", CSS_CHAT)

# s6 : « On aide » + pastilles qui tournent (entreprises, commerçants, restaurants, créateurs), puis « bonjour » en plusieurs langues.
PASTILLES = ["entreprises", "commerçants", "restaurants", "créateurs"]
SALUTS = [("Bonjour", 130, 420, 76, "#2b2b2f"), ("Hello", 660, 360, 64, "#2b2b2f"), ("Mbolo !", 330, 760, 120, "#e8174f"), ("Hola", 760, 600, 58, "#e8174f"),
          ("Salut", 150, 1050, 70, "#2b2b2f"), ("Ciao", 560, 1110, 60, "#2b2b2f"), ("Hallo", 760, 960, 62, "#2b2b2f"), ("Salam", 300, 1240, 56, "#2b2b2f")]
P["s6-aide"] = scene("s6", "Fond clair : « On aide » et des pastilles roses qui tournent comme une roue (entreprises, commerçants, restaurants, créateurs) ; puis « bonjour » dans plusieurs langues autour.",
    "radial-gradient(ellipse 80% 60% at 40% 50%, #f7f7f7 0%, #e6e6e6 100%)",
    """			<div id="s6-aide" class="mot" style="left: 90px; right: auto; top: 800px; font-size: 104px; color: #141418; text-align: left; letter-spacing: -3px">On aide</div>
			<div id="s6-roue" data-layout-allow-overlap style="position: absolute; left: 490px; top: 858px; width: 0; height: 0">
""" + "\n".join(f'				<div class="s6-pastille" style="transform: rotate({-28 * k}deg)"><span>les {m}</span></div>' for k, m in enumerate(PASTILLES)) + """
			</div>
""" + "\n".join(f'			<div class="mot s6-salut" style="left: {x}px; right: auto; top: {y}px; font-size: {t}px; color: {c}; font-family: \'Kit Inter\'; font-weight: 700; letter-spacing: -1px">{m}</div>' for m, x, y, t, c in SALUTS),
    """			fouet('#s6-aide', 0, {dx: -120, flou: 14});
			tl.fromTo('#s6-roue', {opacity: 0, rotation: -60, filter: 'blur(14px)'}, {opacity: 1, rotation: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}, 0.1);
			// La roue tourne d'une pastille à la suivante, en tenant chacune.
			[1, 2, 3].forEach((k) => tl.to('#s6-roue', {rotation: 28 * k, duration: 0.35, ease: 'power3.inOut'}, 0.15 + 0.45 * k));
			// Puis « On aide » et la roue s'effacent : place aux « bonjour ».
			tl.to(['#s6-aide', '#s6-roue'], {opacity: 0, filter: 'blur(14px)', scale: 0.94, duration: 0.22, ease: 'power3.in'}, 1.75);
			// « bonjour » en plusieurs langues, du flou au net, tout autour.
			tl.fromTo('.s6-salut', {opacity: 0, filter: 'blur(12px)', scale: 0.8}, {opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.3, ease: 'expo.out', stagger: 0.07}, 2.0);
			part('#s6-scene', 2.82, {dx: -300});""",
    """		.s6-pastille {
			position: absolute;
			left: -20px;
			top: -60px;
			width: 520px;
			height: 120px;
			transform-origin: 0 60px;
		}
		.s6-pastille span {
			position: absolute;
			left: 80px;
			top: 0;
			height: 120px;
			padding: 0 40px;
			border-radius: 60px;
			background: linear-gradient(180deg, #ff4f7a 0%, #e8174f 100%);
			box-shadow: 0 24px 50px rgba(232, 23, 79, 0.35);
			color: #ffffff;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 58px;
			line-height: 120px;
			white-space: nowrap;
		}
""")

# s8 : AFFICHES : une affiche de produit, gros titre serré, traînées de lumière.
P["s8-affiches"] = scene("s8", "Une affiche de produit : fond bleu nuit, traînées de lumière qui jaillissent du bas, étiquette « AFFICHES », gros titre serré, la basket qui arrive en grand.",
    "radial-gradient(ellipse 90% 70% at 50% 30%, #2a1fa8 0%, #10106a 55%, #070824 100%)",
    """			<div id="s8-lumiere" style="position: absolute; left: -540px; top: 900px; width: 2160px; height: 2160px; border-radius: 50%; background: repeating-conic-gradient(from 0deg at 50% 50%, rgba(255, 60, 200, 0.55) 0deg 2deg, rgba(80, 200, 255, 0.5) 2deg 4deg, rgba(255, 200, 60, 0.45) 4deg 5deg, transparent 5deg 9deg); -webkit-mask-image: radial-gradient(circle, transparent 18%, #000 40%, transparent 72%); mask-image: radial-gradient(circle, transparent 18%, #000 40%, transparent 72%); filter: blur(3px)"></div>
			<div id="s8-tag" style="position: absolute; left: 110px; top: 250px; padding: 14px 28px; border-radius: 14px; background: #ffffff; font-family: 'Kit Inter'; font-weight: 800; font-size: 34px; letter-spacing: 10px; color: #2a1fa8">AFFICHES</div>
			<div class="mot s8-l" style="left: 104px; right: auto; top: 350px; font-size: 118px; color: #ffffff; text-align: left; letter-spacing: -4px; text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4)">VOTRE PRODUIT</div>
			<div class="mot s8-l" style="left: 104px; right: auto; top: 470px; font-size: 118px; color: #ffffff; text-align: left; letter-spacing: -4px; text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4)">EN GRAND,</div>
			<div class="mot s8-l" style="left: 104px; right: auto; top: 590px; font-size: 118px; color: #ffffff; text-align: left; letter-spacing: -4px; text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4)">PARTOUT.</div>
			<div id="s8-ligne" style="position: absolute; left: 110px; top: 750px; font-family: 'Kit Inter'; font-weight: 800; font-size: 30px; letter-spacing: 8px; color: #c9cbff">GIRESSE <span style="color: #6f74ff">|</span> DIGITAL STUDIO</div>
			<div id="s8-produit" class="emoji" style="left: 360px; top: 840px; font-size: 380px; filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 40px rgba(120, 160, 255, 0.5))">👟</div>""",
    """			tl.fromTo('#s8-lumiere', {scale: 0.7, rotation: -6, opacity: 0}, {scale: 1.15, rotation: 6, opacity: 1, duration: 1.6, ease: 'power2.out'}, 0);
			fouet('#s8-tag', 0, {dx: -100, flou: 10, duree: 0.35});
			tl.fromTo('.s8-l', {opacity: 0, x: -160, filter: 'blur(16px)'}, {opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out', stagger: 0.08}, 0.05);
			fouet('#s8-ligne', 0.35, {dx: -60, flou: 8, duree: 0.35});
			tl.fromTo('#s8-produit', {opacity: 0, x: 500, rotation: 25, filter: 'blur(18px)'}, {opacity: 1, x: 0, rotation: -8, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out'}, 0.25);
			part('#s8-scene', 1.5, {dy: 260});""")

# s9 : SITES WEB : un site de réservation sur téléphone qui défile, puis un site pro sombre sur ordinateur.
RESULTATS = "".join(f"""<div style="display: flex; gap: 20px; margin: 0 24px 22px; padding: 18px; border-radius: 22px; background: #ffffff; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08)"><div style="width: 150px; height: 130px; border-radius: 16px; background: {g}"></div><div><div style="font-family: 'Kit Inter'; font-weight: 800; font-size: 28px; color: #1a1a1a">{n}</div><div style="margin-top: 8px; font-family: 'Kit Inter'; font-weight: 700; font-size: 22px; color: #f5a623">★★★★</div><div style="margin-top: 10px"><span style="padding: 4px 10px; border-radius: 8px; background: #0f766e; color: #fff; font-family: 'Kit Inter'; font-weight: 800; font-size: 22px">{note}</span> <span style="font-family: 'Kit Inter'; font-weight: 700; font-size: 22px; color: #4a4a4a">Superbe</span></div></div></div>"""
    for n, note, g in [("Hôtel Les Palmiers", "8,6", "linear-gradient(135deg, #7dd3fc, #0e7490)"), ("Villa Océane", "9,1", "linear-gradient(135deg, #fcd34d, #ea580c)"), ("Le Jardin Lodge", "8,8", "linear-gradient(135deg, #86efac, #15803d)"), ("Résidence Azur", "8,4", "linear-gradient(135deg, #c4b5fd, #6d28d9)")])
P["s9-sites"] = scene("s9", "« SITES WEB » : un site de réservation sur téléphone (recherche, dates, résultats) qui défile ; puis un site pro sombre à accents jaunes sur un ordinateur portable.",
    "linear-gradient(180deg, #dfe9f3 0%, #c9d9ea 100%)",
    """			<div class="mot" id="s9-titre" style="top: 220px; font-size: 140px; color: #ffffff; text-shadow: @RELIEF@">SITES WEB</div>""".replace("@RELIEF@", relief("#9fb4cc", 10, "rgba(60, 90, 130, 0.35)")) + """
			<div id="s9-tel" style="position: absolute; left: 300px; top: 420px; width: 480px; height: 900px; border-radius: 60px; background: #0e0e12; box-shadow: 0 60px 110px rgba(40, 60, 90, 0.35)">
				<div style="position: absolute; inset: 14px; border-radius: 48px; overflow: hidden; background: #f2f4f7">
					<div id="s9-page" style="position: absolute; left: 0; right: 0; top: 0">
						<div style="height: 120px; background: #0f766e; padding: 46px 28px 0; font-family: 'Kit Poppins'; font-weight: 800; font-size: 34px; color: #ffffff">Réservez</div>
						<div style="margin: 20px 24px; padding: 20px; border-radius: 24px; background: #ffd7a8">
							<div class="s9-champ">🔍 Kribi, Cameroun</div>
							<div style="display: flex; gap: 12px"><div class="s9-champ" style="flex: 1">mer. 4 nov.</div><div class="s9-champ" style="flex: 1">jeu. 5 nov.</div></div>
							<div class="s9-champ">2 adultes · 1 chambre</div>
							<div style="height: 76px; border-radius: 16px; background: #f97316; font-family: 'Kit Inter'; font-weight: 800; font-size: 30px; line-height: 76px; text-align: center; color: #ffffff">Rechercher</div>
						</div>
						""" + RESULTATS + """
					</div>
				</div>
			</div>
			<div id="s9-portable" style="position: absolute; left: 110px; top: 520px; width: 860px; opacity: 0">
				<div style="position: relative; height: 540px; border-radius: 28px 28px 0 0; background: #111418; border: 14px solid #2a2d33; overflow: hidden">
					<div style="position: absolute; left: 40px; top: 36px; font-family: 'Kit Poppins'; font-weight: 800; font-size: 28px; color: #ffffff">Votre<span style="color: #facc15">.</span>marque</div>
					<div style="position: absolute; left: 40px; top: 120px; width: 470px; font-family: 'Kit Poppins'; font-weight: 800; font-size: 50px; line-height: 1.1; color: #ffffff">Votre entreprise en ligne, <span style="color: #facc15">24 h / 24</span></div>
					<div style="position: absolute; left: 40px; top: 330px; padding: 16px 30px; border-radius: 12px; background: #facc15; font-family: 'Kit Inter'; font-weight: 800; font-size: 26px; color: #111418">Demander un devis</div>
					<div style="position: absolute; left: 540px; top: 110px; width: 260px; height: 300px; border-radius: 20px; background: #1d2228; border: 2px solid #2f3640">
						<div style="margin: 24px auto 0; width: 150px; height: 150px; border-radius: 75px; border: 26px solid #facc15; border-right-color: #3a414b; box-sizing: border-box"></div>
						<div style="margin: 30px 24px 0; height: 16px; border-radius: 8px; background: #3a414b"></div>
						<div style="margin: 14px 24px 0; width: 120px; height: 16px; border-radius: 8px; background: #3a414b"></div>
					</div>
				</div>
				<div style="height: 34px; margin: 0 -40px; border-radius: 0 0 30px 30px; background: linear-gradient(180deg, #c9ccd2 0%, #9aa0a8 100%)"></div>
			</div>""",
    """			fouet('#s9-titre', 0, {echelle: 1.3});
			fouet('#s9-tel', 0, {dy: 200, echelle: 0.9, duree: 0.5});
			// Le site de réservation défile jusqu'aux résultats.
			tl.fromTo('#s9-page', {y: 0}, {y: -520, duration: 0.8, ease: 'power2.inOut'}, 0.35);
			// Coup de fouet vers le site pro sur ordinateur.
			tl.to('#s9-tel', {opacity: 0, x: -500, filter: 'blur(16px)', duration: 0.22, ease: 'power3.in'}, 1.1);
			tl.fromTo('#s9-portable', {opacity: 0, x: 500, filter: 'blur(16px)'}, {opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'expo.out'}, 1.2);
			part('#s9-scene', 2.0, {dy: -240});""",
    """		.s9-champ {
			margin-bottom: 12px;
			padding: 0 18px;
			height: 64px;
			border-radius: 14px;
			background: #ffffff;
			font-family: 'Kit Inter';
			font-weight: 700;
			font-size: 26px;
			line-height: 64px;
			color: #333333;
			white-space: nowrap;
		}
""")

# s11 : au drop, GIRESSE répond sur WhatsApp ; puis la fiche de contact s'écrit et le logo se pose.
P["s11-contact"] = scene("s11", "Au drop : sur le téléphone, la réponse de GIRESSE arrive (« Oui, on est disponibles ! », « On en parle ? ») ; « VOUS AUSSI, ÉCRIVEZ-NOUS. » ; puis la fiche WhatsApp et mail s'écrit, le logo se pose et reste.",
    "linear-gradient(180deg, #dbe9f5 0%, #c6dcee 100%)",
    """			<div id="s11-chat">
				<div class="mot" id="s11-l1" style="top: 200px; font-size: 104px; color: #ffffff; text-shadow: @RELIEF@">VOUS AUSSI,</div>
				<div class="mot" id="s11-l2" style="top: 320px; font-size: 104px; color: #25d366; text-shadow: @RELIEF@">ÉCRIVEZ-NOUS.</div>
""".replace("@RELIEF@", relief("#6f8fae", 10, "rgba(40, 70, 110, 0.35)")) + TEL_CHAT.format(p="s11", x=270, y=480, w=540, h=840, contenu="\n".join([
        "					" + bulle("s11-b1", "J'aurais besoin d'un site web pour mon entreprise ?", "20:59", 170),
        "					" + bulle("s11-b2", "Êtes-vous disponible ?", "20:59", 370),
        "					" + bulle("s11-r1", "Oui, on est disponibles ! ✅", "21:00", 510, cote="gauche", coche=False),
        "					" + bulle("s11-r2", "On en parle ? 🚀", "21:00", 690, cote="gauche", coche=False)])).replace('id="s11-b1-coche">✓✓', 'id="s11-b1-coche" style="color: #53bdeb">✓✓').replace('id="s11-b2-coche">✓✓', 'id="s11-b2-coche" style="color: #53bdeb">✓✓') + """
			</div>
			<div id="s11-fiche" style="position: absolute; left: 110px; top: 470px; width: 860px; height: 560px; border-radius: 48px; background: linear-gradient(170deg, #ffffff 0%, #f1f3f6 100%); box-shadow: 0 70px 120px rgba(40, 70, 110, 0.3); overflow: hidden; opacity: 0">
				<img src="assets/marque/monogramme.png" style="position: absolute; left: 580px; top: 190px; width: 360px; opacity: 0.08" />
				""" + WA_ICONE.format(x=56, y=60, t=96) + """
				<div class="s11-etiq" style="left: 176px; top: 70px">WhatsApp</div>
				<div id="s11-numero" class="s11-valeur" style="left: 176px; top: 112px"></div>
				<div style="position: absolute; left: 56px; right: 56px; top: 260px; border-top: 4px dashed #c6d3e0"></div>
				<div class="s11-mail" style="left: 56px; top: 310px">✉</div>
				<div class="s11-etiq" style="left: 176px; top: 310px">Email</div>
				<div id="s11-email" class="s11-valeur" style="left: 176px; top: 352px; font-size: 48px"></div>
				<div id="s11-curseur" style="position: absolute; left: 176px; top: 118px; width: 6px; height: 64px; background: #00b8d9"></div>
			</div>
			<img id="s11-logo" src="assets/marque/nom.png" style="position: absolute; left: 240px; top: 1100px; width: 600px; opacity: 0" />""",
    f"""			// Au drop : le téléphone est là, la réponse de GIRESSE arrive, puis la deuxième.
			tl.fromTo('#s11-tel', {{scale: 1.08, filter: 'blur(10px)'}}, {{scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out'}}, 0);
			tl.fromTo(['#s11-b1', '#s11-b2'], {{opacity: 1}}, {{opacity: 1, duration: 0.01}}, 0);
			fouet('#s11-r1', 0.25, {{dx: -60, echelle: 0.85, duree: 0.4, flou: 8}});
			fouet('#s11-r2', 0.7, {{dx: -60, echelle: 0.85, duree: 0.4, flou: 8}});
			fouet('#s11-l1', 0.45, {{echelle: 1.3, flou: 16}});
			fouet('#s11-l2', 0.6, {{echelle: 1.3, flou: 16}});
			// Le téléphone s'envole, la fiche arrive : le numéro et le mail s'écrivent.
			tl.to('#s11-chat', {{opacity: 0, y: -260, filter: 'blur(16px)', duration: 0.3, ease: 'power3.in'}}, 1.75);
			tl.fromTo('#s11-fiche', {{opacity: 0, y: 500, rotationX: 30, rotationZ: -10, transformPerspective: 1600, filter: 'blur(14px)'}}, {{opacity: 1, y: 0, rotationX: 0, rotationZ: 0, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out'}}, 1.85);
			const ecrire = (sel, texte, t, d) => {{
				const el = document.querySelector(sel);
				const e = {{n: 0}};
				tl.fromTo(e, {{n: 0}}, {{n: texte.length, duration: d, ease: 'none', onUpdate: () => (el.textContent = texte.slice(0, Math.round(e.n)))}}, t);
			}};
			ecrire('#s11-numero', '{NUMERO}', 2.2, 0.7);
			tl.to('#s11-curseur', {{x: 530, duration: 0.7, ease: 'none'}}, 2.2);
			tl.set('#s11-curseur', {{x: 0, y: 240}}, 2.95);
			ecrire('#s11-email', '{EMAIL}', 3.0, 0.9);
			tl.to('#s11-curseur', {{x: 610, duration: 0.9, ease: 'none'}}, 3.0);
			tl.set('#s11-curseur', {{opacity: 0}}, 4.0);
			// Le logo se pose sous la fiche et tout reste à l'écran jusqu'à la fin.
			tl.fromTo('#s11-logo', {{opacity: 0, y: 60, filter: 'blur(14px)'}}, {{opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out'}}, 3.9);""",
    CSS_CHAT + """		.s11-etiq {
			position: absolute;
			font-family: 'Kit Inter';
			font-weight: 700;
			font-size: 36px;
			line-height: 1;
			color: #6b7a90;
		}
		.s11-valeur {
			position: absolute;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 62px;
			line-height: 1;
			color: #141418;
			white-space: nowrap;
		}
		.s11-mail {
			position: absolute;
			width: 96px;
			height: 96px;
			border-radius: 48px;
			background: linear-gradient(160deg, #3a3a3f 0%, #2b2b2f 100%);
			color: #ffffff;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 50px;
			line-height: 96px;
			text-align: center;
		}
""")

os.makedirs(COMPO, exist_ok=True)
for nom, contenu in P.items():
    open(os.path.join(COMPO, f"{nom}.html"), "w").write(contenu)

# Bruitages : (heure, fichier, volume) : seulement les messages, la musique fait le reste.
DUREES_SONS = {"pop": 0.2, "ding": 1.0}
SONS = [(4.72, "ding", 0.45), (5.62, "pop", 0.35), (6.07, "pop", 0.35), (19.17, "pop", 0.4), (19.62, "pop", 0.4)]
hotes = "\n".join(
    f'			<div id="{i}" class="clip" data-composition-id="{i}" data-composition-src="compositions/{f}.html" data-start="{d}" data-duration="{du}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: {k + 2}"></div>'
    for k, (i, f, d, du) in enumerate(SCENES))
sons = "\n".join(
    f'			<audio id="son-{k + 1}" class="clip" src="assets/sons/{f}.wav" data-start="{t}" data-duration="{DUREES_SONS[f]}" data-track-index="{3 + k % 3}" data-volume="{v}"></audio>'
    for k, (t, f, v) in enumerate(SONS))
open(os.path.join(ICI, "index.html"), "w").write(f"""<!doctype html>
<!-- Généré par generer.py : ne pas modifier à la main. -->
<html lang="fr">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=1080, height=1920" />
		<script src="assets/kit/gsap.min.js"></script>
		<style>
			* {{
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}}
			html,
			body {{
				width: 1080px;
				height: 1920px;
				overflow: hidden;
				background: #0b0b0e;
			}}
		</style>
	</head>
	<body>
		<div id="root" data-composition-id="main" data-start="0" data-duration="{DUREE}" data-width="1080" data-height="1920">
{hotes}
			<audio id="musique" class="clip" src="assets/audio/musique.wav" data-start="0" data-duration="{DUREE}" data-track-index="2" data-volume="1"></audio>
{sons}
		</div>
		<script>
			window.__timelines = window.__timelines || {{}};
			window.__timelines['main'] = gsap.timeline({{paused: true}});
		</script>
	</body>
</html>
""")

# Copies : GSAP, polices, logo.
def copier(de, vers):
    os.makedirs(os.path.dirname(vers), exist_ok=True)
    shutil.copyfile(de, vers)
nm = os.path.join(RACINE, "node_modules")
copier(os.path.join(nm, "gsap/dist/gsap.min.js"), os.path.join(ASSETS, "kit/gsap.min.js"))
for de, vers in [("@fontsource/poppins/files/poppins-latin-800-normal.woff2", "poppins-800"), ("@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800"), ("@fontsource/inter/files/inter-latin-700-normal.woff2", "inter-700")]:
    copier(os.path.join(nm, de), os.path.join(ASSETS, f"kit/fonts/{vers}.woff2"))
for f in ("monogramme.png", "nom.png", "logo-complet.png"):
    copier(os.path.join(RACINE, "channels/giresse/logo", f), os.path.join(ASSETS, "marque", f))

# Musique : le morceau fourni (public/audio/giresse-002-musique.wav), et deux bruitages générés avec ffmpeg.
def ff(expr, sortie, duree, filtres=""):
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    src = f"aevalsrc='{expr}':s=48000:d={duree}"
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", src]
    if filtres:
        cmd += ["-af", filtres]
    subprocess.run(cmd + ["-ac", "1", sortie], check=True)

copier(os.path.join(RACINE, "public/audio/giresse-002-musique.wav"), os.path.join(ASSETS, "audio/musique.wav"))
S = os.path.join(ASSETS, "sons")
ff("0.9*sin(2*PI*(520+900*exp(-t*40))*t)*exp(-t*28)", os.path.join(S, "pop.wav"), 0.2)
ff("0.6*sin(2*PI*1318*t)*exp(-t*5)+0.4*sin(2*PI*1975*t)*exp(-t*6)", os.path.join(S, "ding.wav"), 1.0)
print("ok :", len(P), "scènes,", len(SONS), "bruitages")
