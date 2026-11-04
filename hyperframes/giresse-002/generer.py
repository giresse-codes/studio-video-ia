# Pub GIRESSE #002 (sans voix off, rythme 120 BPM) : python3 hyperframes/giresse-002/generer.py
# Écrit index.html, les scènes (compositions/), la musique et les bruitages (générés en local avec ffmpeg),
# et copie GSAP, les polices et le logo dans assets/.
import os, shutil, subprocess

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", ".."))
COMPO = os.path.join(ICI, "compositions")
ASSETS = os.path.join(ICI, "assets")
DUREE = 24.0
NUMERO = "+237 673 236 084"
EMAIL = "giressepablo17@gmail.com"

# Scènes : (id, fichier, début, durée). Les coupes tombent sur le temps (0,5 s à 120 BPM).
SCENES = [
    ("s1", "s1-projet", 0.0, 2.0),
    ("s2", "s2-services", 2.0, 2.5),
    ("s3", "s3-swipez", 4.5, 1.0),
    ("s4", "s4-endroit", 5.5, 2.0),
    ("s5", "s5-giresse", 7.5, 2.0),
    ("s6", "s6-grandir", 9.5, 2.5),
    ("s7", "s7-pubs", 12.0, 1.3),
    ("s8", "s8-sites", 13.3, 1.3),
    ("s9", "s9-applis", 14.6, 1.3),
    ("s10", "s10-contact", 15.9, 8.1),
]

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
			part('#s1-scene', 1.82, {dx: -420});""",
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

# s2 : les onglets Pubs / Sites / Applis ; la carte tourne d'un service à l'autre, avec son reflet.
CARTES = {
    "pub": """<div style="position: absolute; inset: 0; border-radius: 46px; background: linear-gradient(170deg, #3a3a3f 0%, #141418 100%)"></div>
						<div style="position: absolute; left: 130px; top: 250px; width: 160px; height: 160px; border-radius: 80px; background: #ffffff; box-shadow: 0 0 60px rgba(255, 255, 255, 0.5)"></div>
						<div style="position: absolute; left: 190px; top: 292px; width: 0; height: 0; border-left: 62px solid #141418; border-top: 38px solid transparent; border-bottom: 38px solid transparent"></div>
						<div style="position: absolute; left: 0; right: 0; top: 480px; text-align: center; font-family: 'Kit Poppins'; font-weight: 800; font-size: 46px; color: #ffffff">Ta pub animée</div>""",
    "site": """<div style="position: absolute; inset: 0; border-radius: 46px; background: linear-gradient(170deg, #ffffff 0%, #eef1f6 100%)"></div>
						<div style="position: absolute; left: 30px; right: 30px; top: 40px; height: 54px; border-radius: 27px; background: #e3e8f0"></div>
						<div style="position: absolute; left: 30px; right: 30px; top: 130px; height: 250px; border-radius: 30px; background: linear-gradient(135deg, #ffb347 0%, #ff5e62 100%)"></div>
						<div style="position: absolute; left: 30px; width: 220px; top: 410px; height: 30px; border-radius: 15px; background: #d6dce6"></div>
						<div style="position: absolute; left: 30px; width: 300px; top: 460px; height: 30px; border-radius: 15px; background: #d6dce6"></div>
						<div style="position: absolute; left: 30px; right: 30px; top: 540px; height: 90px; border-radius: 45px; background: #141418; font-family: 'Kit Inter'; font-weight: 800; font-size: 38px; line-height: 90px; text-align: center; color: #ffffff">Commander</div>""",
    "appli": """<div style="position: absolute; inset: 0; border-radius: 46px; background: linear-gradient(170deg, #12c2b9 0%, #0a5f8f 55%, #2b1a6b 100%)"></div>
						<div style="position: absolute; left: 40px; top: 60px; font-family: 'Kit Poppins'; font-weight: 800; font-size: 60px; color: #ffffff">Bonjour 👋</div>
						<div class="s2-tuile" style="left: 40px; top: 190px"></div><div class="s2-tuile" style="left: 220px; top: 190px"></div>
						<div class="s2-tuile" style="left: 40px; top: 370px"></div><div class="s2-tuile" style="left: 220px; top: 370px"></div>
						<div style="position: absolute; left: 40px; right: 40px; top: 560px; height: 80px; border-radius: 40px; background: rgba(255, 255, 255, 0.92); font-family: 'Kit Inter'; font-weight: 800; font-size: 34px; line-height: 80px; text-align: center; color: #0a5f8f">✓ Réservé</div>""",
}
def carte(k):
    return f"""				<div id="s2-{k}" class="s2-carte">
						{CARTES[k]}
					</div>"""
P["s2-services"] = scene("s2", "Studio blanc : les onglets Pubs, Sites, Applis ; la carte tourne d'un service à l'autre, avec son reflet sur le sol.",
    "linear-gradient(180deg, #f6f7f9 0%, #e9ecf1 58%, #d9dde4 58.1%, #f1f3f6 100%)",
    """			<div id="s2-onglets" style="position: absolute; left: 250px; top: 300px; width: 580px; height: 90px; border-radius: 45px; background: rgba(20, 20, 24, 0.08)">
				<div id="s2-actif" style="position: absolute; left: 6px; top: 6px; width: 184px; height: 78px; border-radius: 39px; background: #141418"></div>
				<div class="s2-onglet" style="left: 0">Pubs</div>
				<div class="s2-onglet" style="left: 193px">Sites</div>
				<div class="s2-onglet" style="left: 386px">Applis</div>
			</div>
			<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; perspective: 1800px">
""" + "\n".join(carte(k) for k in ("pub", "site", "appli")) + """
			</div>
			<div style="position: absolute; left: 0; top: 1150px; width: 1080px; height: 520px; transform: scaleY(-1); opacity: 0.22; -webkit-mask-image: linear-gradient(0deg, #000 0%, transparent 55%); mask-image: linear-gradient(0deg, #000 0%, transparent 55%); filter: blur(2px)">
				<div id="s2-reflet" style="position: absolute; left: 330px; top: -40px; width: 420px; height: 520px; border-radius: 46px; background: #141418"></div>
			</div>""",
    """			// Les trois cartes : chacune entre en pivotant, puis cède la place à la suivante (l'onglet glisse).
			const cartes = ['#s2-pub', '#s2-site', '#s2-appli'];
			const couleurs = ['#141418', '#ffffff', '#0a8f9f'];
			cartes.forEach((c, i) => {
				const t = i * 0.8;
				tl.fromTo(c, {opacity: 0, rotationY: 70, x: 260, filter: 'blur(14px)'}, {opacity: 1, rotationY: 0, x: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}, t + 0.02);
				tl.to('#s2-actif', {x: i * 193, duration: 0.35, ease: 'expo.out'}, t);
				tl.to('#s2-reflet', {backgroundColor: couleurs[i], duration: 0.2}, t + 0.05);
				tl.to('.s2-onglet', {color: (k) => (k === i ? '#ffffff' : '#5b6170'), duration: 0.15}, t);
				if (i < 2) tl.to(c, {opacity: 0, rotationY: -70, x: -260, filter: 'blur(14px)', duration: 0.3, ease: 'power3.in'}, t + 0.62);
			});
			fouet('#s2-onglets', 0, {dy: -60});
			part('#s2-scene', 2.32, {dy: -300});""",
    """		.s2-onglet {
			position: absolute;
			top: 0;
			width: 194px;
			height: 90px;
			text-align: center;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 38px;
			line-height: 90px;
			color: #5b6170;
		}
		.s2-carte {
			position: absolute;
			left: 330px;
			top: 470px;
			width: 420px;
			height: 680px;
			border-radius: 46px;
			box-shadow: 0 60px 100px rgba(20, 20, 24, 0.28);
			opacity: 0;
		}
		.s2-tuile {
			position: absolute;
			width: 160px;
			height: 160px;
			border-radius: 34px;
			background: rgba(255, 255, 255, 0.22);
			border: 2px solid rgba(255, 255, 255, 0.35);
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
			tl.fromTo('#s4-epingle', {opacity: 0, y: -900}, {opacity: 1, y: 0, duration: 0.42, ease: 'power3.in'}, 0.6);
			tl.to('#s4-epingle', {scaleY: 0.78, scaleX: 1.2, transformOrigin: '50% 100%', duration: 0.07, ease: 'power2.out'}, 1.02);
			tl.to('#s4-epingle', {scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)'}, 1.09);
			tl.fromTo('#s4-cible', {scale: 1}, {scale: 1.04, duration: 0.1, ease: 'power2.out', yoyo: true, repeat: 1}, 1.02);
			part('#s4-scene', 1.82, {dx: 420});""")

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
			tl.to('.s5-lame', {x: 120, duration: 1.4, ease: 'none'}, 0.6);
			part('#s5-scene', 1.82, {dy: -300});""",
    """		.s5-lame {
			position: absolute;
			width: 760px;
			height: 120px;
			border-radius: 12px;
			box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
		}
""")

# s6 : « ET ON VOUS AIDE À FAIRE GRANDIR VOTRE BUSINESS » en néon sur fond noir ; une plante pousse ; l'image se réchauffe.
BRANCHES = ["M 540 1480 C 540 1300 530 1180 540 1020", "M 538 1260 C 470 1200 420 1160 380 1080", "M 540 1200 C 610 1150 660 1100 700 1010",
            "M 540 1100 C 500 1060 470 1000 470 930", "M 541 1080 C 590 1040 610 990 615 920", "M 400 1100 C 360 1080 330 1050 310 1000",
            "M 680 1040 C 720 1020 750 990 770 950", "M 540 1020 C 540 980 545 950 545 900"]
FEUILLES = [(380, 1080), (700, 1010), (470, 930), (615, 920), (310, 1000), (770, 950), (545, 900), (430, 1150), (650, 1120)]
P["s6-grandir"] = scene("s6", "Fond noir et néon : « ET ON VOUS AIDE », puis « À FAIRE GRANDIR » ; une plante lumineuse pousse ; « VOTRE BUSINESS » en jaune néon, l'image se réchauffe.",
    "radial-gradient(ellipse 70% 50% at 50% 55%, #2a2a2e 0%, #0d0d10 70%)",
    """			<div id="s6-chaud" style="position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 60%, #ff9a3c 0%, #c2410c 55%, #4a1205 100%); opacity: 0"></div>
			<div class="mot s6-neon" id="s6-l1" style="top: 300px; font-size: 76px; color: #ffffff">ET ON VOUS AIDE</div>
			<div class="mot s6-neon" id="s6-l2" style="top: 420px; font-size: 76px; color: #ffffff">À FAIRE GRANDIR</div>
			<div class="mot s6-jaune" id="s6-l3" style="top: 560px; font-size: 130px">VOTRE</div>
			<div class="mot s6-jaune" id="s6-l4" style="top: 700px; font-size: 130px">BUSINESS</div>
			<svg style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px" viewBox="0 0 1080 1920">
				<g fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" style="filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))">
""" + "\n".join(f'					<path class="s6-branche" d="{d}" />' for d in BRANCHES) + """
				</g>
				<g fill="#e8ff3a" style="filter: drop-shadow(0 0 14px #e8ff3a)">
""" + "\n".join(f'					<ellipse class="s6-feuille" cx="{x}" cy="{y}" rx="26" ry="16" />' for x, y in FEUILLES) + """
				</g>
			</svg>""",
    """			fouet('#s6-l1', 0, {flou: 14, echelle: 1.15});
			fouet('#s6-l2', 0.75, {flou: 14, echelle: 1.15});
			// La plante pousse, branche après branche, puis ses feuilles s'allument.
			document.querySelectorAll('.s6-branche').forEach((b, i) => {
				const l = b.getTotalLength();
				tl.fromTo(b, {strokeDasharray: l, strokeDashoffset: l}, {strokeDashoffset: 0, duration: 0.6, ease: 'power2.out'}, 0.7 + i * 0.1);
			});
			tl.fromTo('.s6-feuille', {scale: 0, transformOrigin: '50% 50%'}, {scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.06}, 1.3);
			// « VOTRE BUSINESS » en jaune néon ; l'image se réchauffe d'un coup.
			fouet('#s6-l3', 1.2, {echelle: 1.6, flou: 20, duree: 0.4});
			fouet('#s6-l4', 1.32, {echelle: 1.6, flou: 20, duree: 0.4});
			tl.to('#s6-chaud', {opacity: 1, duration: 0.35, ease: 'power2.inOut'}, 1.95);
			part('#s6-scene', 2.32, {dy: -200});""",
    """		.s6-neon {
			text-shadow: 0 0 18px rgba(255, 255, 255, 0.75), 0 0 40px rgba(255, 255, 255, 0.35);
		}
		.s6-jaune {
			color: #f4ff6a;
			text-shadow: 0 0 20px #e8ff3a, 0 0 60px rgba(232, 255, 58, 0.6);
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
			tl.fromTo('#s7-tete', {x: 0}, {x: 680, duration: 1.0, ease: 'none'}, 0.15);
			fouet('#s7-b1', 0.2, {echelle: 0.3});
			fouet('#s7-b2', 0.3, {echelle: 0.3});
			part('#s7-scene', 1.14, {dx: -300});""",
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

# s8 : SITES WEB : une sphère violette, des colonnes de pages qui montent comme une ville.
COLONNES = [(140, 260), (250, 420), (360, 330), (470, 560), (580, 380), (690, 500), (800, 300)]
P["s8-sites"] = scene("s8", "Fond pâle : une grande sphère violette en haut ; des colonnes jaunes et orange montent comme une ville ; « SITES WEB » en relief.",
    PALE,
    """			<div id="s8-sphere" style="position: absolute; left: 240px; top: -280px; width: 600px; height: 600px; border-radius: 300px; background: radial-gradient(circle at 40% 70%, #c45cff 0%, #7a1fd6 50%, #3b0a8f 100%); box-shadow: 0 40px 120px rgba(122, 31, 214, 0.5)"></div>
""" + "\n".join(f'			<div class="s8-col" style="left: {x}px; top: {1420 - h}px; height: {h}px"></div>' for x, h in COLONNES) + """
			""" + titre_pale("s8", "SITES WEB", 150),
    """			tl.fromTo('#s8-sphere', {y: -200, filter: 'blur(14px)'}, {y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out'}, 0);
			tl.fromTo('.s8-col', {scaleY: 0, transformOrigin: '50% 100%'}, {scaleY: 1, duration: 0.55, ease: 'expo.out', stagger: 0.05}, 0.05);
			fouet('#s8-titre', 0.1, {echelle: 1.3});
			part('#s8-scene', 1.14, {dx: -300});""",
    """		.s8-col {
			position: absolute;
			width: 96px;
			border-radius: 10px 10px 0 0;
			background: linear-gradient(90deg, #ff8a00 0%, #ffd23f 45%, #ffb000 100%);
			box-shadow: 0 0 40px rgba(255, 170, 0, 0.45);
		}
""")

# s9 : APPLICATIONS : dégradé irisé qui bouge, un téléphone de verre.
P["s9-applis"] = scene("s9", "Dégradé irisé qui bouge ; un téléphone de verre se pose ; « APPLICATIONS » en blanc.",
    "#ffffff",
    """			<div id="s9-irise" style="position: absolute; left: -400px; top: -400px; width: 1880px; height: 2720px; background: radial-gradient(circle at 30% 30%, #00e5ff 0%, transparent 35%), radial-gradient(circle at 75% 35%, #ff4d8d 0%, transparent 35%), radial-gradient(circle at 40% 70%, #ffe600 0%, transparent 35%), radial-gradient(circle at 75% 75%, #8f00ff 0%, transparent 35%); filter: blur(60px)"></div>
			<div id="s9-tel" style="position: absolute; left: 380px; top: 700px; width: 320px; height: 600px; border-radius: 60px; background: rgba(255, 255, 255, 0.28); border: 4px solid rgba(255, 255, 255, 0.7); box-shadow: 0 50px 100px rgba(60, 0, 120, 0.3)">
				<div style="position: absolute; left: 110px; top: 26px; width: 100px; height: 28px; border-radius: 14px; background: rgba(255, 255, 255, 0.8)"></div>
			</div>
			<div class="mot" id="s9-titre" style="top: 470px; font-size: 128px; color: #ffffff; text-shadow: 0 4px 30px rgba(80, 0, 160, 0.45)">APPLICATIONS</div>""",
    """			tl.fromTo('#s9-irise', {x: 0, y: 0, rotation: 0}, {x: 180, y: -160, rotation: 18, duration: 1.3, ease: 'none'}, 0);
			fouet('#s9-titre', 0, {echelle: 1.3});
			fouet('#s9-tel', 0.15, {dy: 200, echelle: 0.8});
			part('#s9-scene', 1.14, {dy: -200});""")

# s10 : le contact : un bouton cyan devient « envoyer », la fiche de contact s'incline et s'écrit ; puis le logo.
P["s10-contact"] = scene("s10", "Fond bleu pâle : un point cyan devient le bouton « envoyer » ; la fiche inclinée s'écrit : WhatsApp, numéro, mail ; puis la fiche se redresse et le logo GIRESSE se pose.",
    "linear-gradient(180deg, #dbe9f5 0%, #c6dcee 100%)",
    f"""			<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; perspective: 1600px">
				<div id="s10-fiche" data-layout-allow-overlap style="position: absolute; left: 110px; top: 560px; width: 860px; height: 500px; border-radius: 48px; background: linear-gradient(170deg, #ffffff 0%, #f1f3f6 100%); box-shadow: 0 70px 120px rgba(40, 70, 110, 0.3); overflow: hidden">
					<img src="assets/marque/monogramme.png" style="position: absolute; left: 560px; top: 150px; width: 380px; opacity: 0.09" />
					<div class="s10-etiq" style="top: 60px">WhatsApp</div>
					<div id="s10-numero" class="s10-valeur" style="top: 130px"></div>
					<div style="position: absolute; left: 60px; right: 60px; top: 260px; border-top: 4px dashed #c6d3e0"></div>
					<div id="s10-ou" class="s10-etiq" style="top: 300px">ou par mail</div>
					<div id="s10-email" class="s10-valeur" style="top: 370px; font-size: 54px"></div>
					<div id="s10-curseur" style="position: absolute; left: 60px; top: 140px; width: 6px; height: 72px; background: #00b8d9"></div>
				</div>
			</div>
			<div id="s10-bouton" style="position: absolute; left: 140px; top: 360px; width: 140px; height: 140px; border-radius: 70px; background: radial-gradient(circle at 35% 30%, #7ff3ff 0%, #00c6e0 60%, #0094b8 100%); box-shadow: 0 30px 60px rgba(0, 150, 190, 0.45)">
				<svg style="position: absolute; left: 32px; top: 34px; width: 76px; height: 76px" viewBox="0 0 76 76"><path d="M 6 36 L 70 6 L 46 70 L 36 44 Z" fill="#FFFFFF" /><path d="M 36 44 L 70 6" stroke="#00A3C4" stroke-width="4" /></svg>
			</div>
			<div id="s10-pastille" style="position: absolute; left: 310px; top: 380px; height: 100px; padding: 0 44px; border-radius: 50px; background: linear-gradient(180deg, #3a3a3f 0%, #141418 100%); color: #ffffff; font-family: 'Kit Inter'; font-weight: 800; font-size: 46px; line-height: 100px; white-space: nowrap; box-shadow: 0 24px 48px rgba(20, 20, 24, 0.3)">Écrivez-nous</div>
			<div id="s10-logo" style="position: absolute; left: 240px; top: 1140px; width: 600px; height: 0">
				<img src="assets/marque/nom.png" style="position: absolute; left: 0; top: 0; width: 600px" />
			</div>""",
    f"""			// Le point cyan surgit et devient le bouton « envoyer » ; la pastille « Écrivez-nous » sort de lui.
			tl.fromTo('#s10-bouton', {{opacity: 0, scale: 0.2, x: 400, y: 500}}, {{opacity: 1, scale: 1, x: 0, y: 0, duration: 0.55, ease: 'expo.out'}}, 0);
			tl.fromTo('#s10-pastille', {{opacity: 0, x: -160, scaleX: 0.3, transformOrigin: '0% 50%', filter: 'blur(10px)'}}, {{opacity: 1, x: 0, scaleX: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}}, 0.35);
			// La fiche glisse, inclinée, puis le numéro et le mail s'écrivent.
			tl.fromTo('#s10-fiche', {{opacity: 0, y: 700, rotationX: 35, rotationZ: -14, filter: 'blur(14px)'}}, {{opacity: 1, y: 0, rotationX: 14, rotationZ: -8, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out'}}, 0.45);
			const ecrire = (sel, texte, t, d) => {{
				const el = document.querySelector(sel);
				const e = {{n: 0}};
				tl.fromTo(e, {{n: 0}}, {{n: texte.length, duration: d, ease: 'none', onUpdate: () => (el.textContent = texte.slice(0, Math.round(e.n)))}}, t);
			}};
			ecrire('#s10-numero', '{NUMERO}', 1.1, 1.0);
			tl.to('#s10-curseur', {{x: 560, duration: 1.0, ease: 'none'}}, 1.1);
			tl.to('#s10-curseur', {{y: 235, x: 0, duration: 0.01}}, 2.4);
			fouet('#s10-ou', 2.2, {{dx: -60, duree: 0.35}});
			ecrire('#s10-email', '{EMAIL}', 2.5, 1.4);
			tl.to('#s10-curseur', {{x: 690, duration: 1.4, ease: 'none'}}, 2.5);
			tl.to('#s10-curseur', {{opacity: 0, duration: 0.01, yoyo: true, repeat: 7}}, 4.0);
			tl.set('#s10-curseur', {{opacity: 0}}, 4.4);
			// La fiche se redresse, le logo se pose dessous ; tout reste lisible jusqu'à la fin.
			tl.to('#s10-fiche', {{rotationX: 0, rotationZ: 0, y: -40, duration: 0.7, ease: 'power2.inOut'}}, 4.2);
			tl.to(['#s10-bouton', '#s10-pastille'], {{y: -40, duration: 0.7, ease: 'power2.inOut'}}, 4.2);
			tl.fromTo('#s10-logo', {{opacity: 0, y: 60, filter: 'blur(14px)'}}, {{opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out'}}, 4.6);""",
    """		.s10-etiq {
			position: absolute;
			left: 60px;
			font-family: 'Kit Inter';
			font-weight: 700;
			font-size: 40px;
			line-height: 1;
			color: #6b7a90;
		}
		.s10-valeur {
			position: absolute;
			left: 60px;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 66px;
			line-height: 1;
			color: #141418;
			white-space: nowrap;
		}
""")

os.makedirs(COMPO, exist_ok=True)
for nom, contenu in P.items():
    open(os.path.join(COMPO, f"{nom}.html"), "w").write(contenu)

# Bruitages : (heure, fichier, volume).
DUREES_SONS = {"fouet": 0.45, "impact": 0.8, "pop": 0.2, "ding": 1.0}
SONS = [(s[2], "fouet", 0.55) for s in SCENES[1:]] + [(4.5, "impact", 0.8), (6.52, "pop", 0.7), (7.95, "impact", 0.45), (11.45, "impact", 0.5), (20.5, "ding", 0.6)]
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

# Musique (120 BPM, la mineur : la, fa, do, sol) et bruitages, générés avec ffmpeg.
def ff(expr, sortie, duree, filtres=""):
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    src = f"aevalsrc='{expr}':s=48000:d={duree}"
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", src]
    if filtres:
        cmd += ["-af", filtres]
    subprocess.run(cmd + ["-ac", "1", sortie], check=True)

TMP = os.path.join(ASSETS, "audio")
# Basse : une note par mesure de 2 s.
f_basse = "(55*eq(mod(floor(t/2)\\,4)\\,0)+43.65*eq(mod(floor(t/2)\\,4)\\,1)+65.41*eq(mod(floor(t/2)\\,4)\\,2)+49*eq(mod(floor(t/2)\\,4)\\,3))"
ff(f"0.9*sin(2*PI*(45+100*exp(-mod(t\\,0.5)*35))*mod(t\\,0.5))*exp(-mod(t\\,0.5)*10)", os.path.join(TMP, "kick.wav"), DUREE)
ff("(random(0)*2-1)*exp(-mod(t+0.25\\,0.5)*70)", os.path.join(TMP, "hat.wav"), DUREE, "highpass=f=7000")
ff(f"0.55*sin(2*PI*{f_basse}*t)*(0.6+0.4*exp(-mod(t\\,0.5)*6))", os.path.join(TMP, "basse.wav"), DUREE, "lowpass=f=300")
ff(f"0.14*(sin(2*PI*4*{f_basse}*t)+sin(2*PI*4*1.1892*{f_basse}*t)+sin(2*PI*6*{f_basse}*t))*(0.7+0.3*sin(2*PI*0.25*t))", os.path.join(TMP, "nappe.wav"), DUREE, "lowpass=f=2500")
musique = os.path.join(TMP, "musique.wav")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + sum([["-i", os.path.join(TMP, f)] for f in ("kick.wav", "hat.wav", "basse.wav", "nappe.wav")], []) +
    ["-filter_complex", "[0]volume=1.0[a];[1]volume=0.22[b];[2]volume=0.8[c];[3]volume=0.6[d];[a][b][c][d]amix=inputs=4:normalize=0,afade=t=out:st=22.8:d=1.2,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "2", musique], check=True)
for f in ("kick.wav", "hat.wav", "basse.wav", "nappe.wav"):
    os.remove(os.path.join(TMP, f))
S = os.path.join(ASSETS, "sons")
ff("(random(0)*2-1)*sin(PI*t/0.45)", os.path.join(S, "fouet.wav"), 0.45, "bandpass=f=1800:w=1500,volume=1.6")
ff("0.9*sin(2*PI*(40+120*exp(-t*20))*t)*exp(-t*6)+0.4*(random(1)*2-1)*exp(-t*25)", os.path.join(S, "impact.wav"), 0.8, "lowpass=f=1500")
ff("0.9*sin(2*PI*(520+900*exp(-t*40))*t)*exp(-t*28)", os.path.join(S, "pop.wav"), 0.2)
ff("0.6*sin(2*PI*1318*t)*exp(-t*5)+0.4*sin(2*PI*1975*t)*exp(-t*6)", os.path.join(S, "ding.wav"), 1.0)
print("ok :", len(P), "scènes,", len(SONS), "bruitages")
