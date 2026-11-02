# Génère les scènes de la pub GIRESSE : python3 hyperframes/giresse-001/generer-scenes.py hyperframes/giresse-001/compositions
import sys, os
DOSSIER = sys.argv[1]

BASE = """		/* Polices déjà déclarées dans kit.css ; répétées ici pour le contrôle HyperFrames. */
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
			font-family: 'Kit Poppins';
			font-weight: 800;
			src: url('assets/kit/fonts/poppins-800.woff2') format('woff2');
		}
		@font-face {
			font-family: 'Kit Emoji';
			src: local('Noto Color Emoji');
		}
		.centre {
			position: absolute;
			left: 0;
			right: 0;
			text-align: center;
		}
		.centre .pilule {
			position: static;
			display: inline-block;
		}
"""

ECHELLES = {"s1": 1.25, "s2": 1.2, "s3": 1.2, "s4": 1.2, "s5": 1.2, "s6": 1.2, "s7": 1.08, "s8": 1.2, "s9": 1.25, "s10": 1.15}

def page(n, desc, html, js, css=""):
    css += f"""		#{n}-stage .objets {{
			transform: scale({ECHELLES[n]});
			transform-origin: 540px 820px;
		}}
"""
    return f"""<template>
	<style>
		#root {{
			position: absolute;
			inset: 0;
		}}
{BASE}{css}	</style>
	<div id="root" data-composition-id="{n}" data-width="1080" data-height="1920">
		<div class="stage" id="{n}-stage">
			<div class="cam">
				<div class="punch">
					<div class="fond">
						<div class="decor"></div>
					</div>
					<!-- {desc} -->
					<div class="objets">
{html}
					</div>
					<div class="avant"></div>
				</div>
			</div>
		</div>
	</div>
	<script>
		(function () {{
			const S = kit.scene('{n}', {{travelling: false}});
			const tl = S.tl;

{js}
			S.fin();
		}})();
	</script>
</template>
"""

# Curseur (flèche) dessiné.
CURSEUR = """<svg id="{id}" class="curseur-pub" viewBox="0 0 90 110" style="left: {x}px; top: {y}px"><path d="M 8 6 L 8 86 L 28 68 L 42 100 L 58 93 L 44 62 L 72 62 Z" fill="#FFFFFF" stroke="#2B2B2F" stroke-width="7" stroke-linejoin="round" /></svg>"""

P = {}

# s1 : projet, marque, business, « connu ».
P["s1-projet"] = page("s1", "Objets : une carte « projet » (ampoule, croquis) qui devient une marque (badge, couleurs) puis un commerce (auvent, « ouvert ») ; « connu » : halo et étincelles.",
"""						<div id="s1-halo" style="position: absolute; left: 140px; top: 420px; width: 800px; height: 800px; border-radius: 400px; background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(158, 151, 140, 0.25) 45%, rgba(158, 151, 140, 0) 70%); opacity: 0"></div>
						<div id="s1-carte" class="carte-pub" style="left: 290px; top: 600px; width: 500px; height: 560px">
							<div id="s1-ampoule" class="emoji" style="left: 50px; top: 50px; font-size: 150px">💡</div>
							<div class="s1-trait" style="position: absolute; left: 50px; top: 260px; width: 380px; height: 26px; border-radius: 13px; background: #e7e3dc"></div>
							<div class="s1-trait" style="position: absolute; left: 50px; top: 310px; width: 300px; height: 26px; border-radius: 13px; background: #e7e3dc"></div>
							<div class="s1-trait" style="position: absolute; left: 50px; top: 360px; width: 340px; height: 26px; border-radius: 13px; background: #e7e3dc"></div>
							<div class="s1-teinte" style="position: absolute; left: 50px; top: 440px; width: 70px; height: 70px; border-radius: 35px; background: #2b2b2f"></div>
							<div class="s1-teinte" style="position: absolute; left: 135px; top: 440px; width: 70px; height: 70px; border-radius: 35px; background: #9e978c"></div>
							<div class="s1-teinte" style="position: absolute; left: 220px; top: 440px; width: 70px; height: 70px; border-radius: 35px; background: #e4e0d8"></div>
							<div id="s1-ouvert" class="pilule" style="left: 300px; top: 446px; font-size: 34px; padding: 10px 24px 12px; background: linear-gradient(180deg, #34d27a 0%, #23b866 100%)">OUVERT</div>
						</div>
						<div id="s1-badge" style="position: absolute; left: 690px; top: 700px; width: 170px; height: 170px; border-radius: 95px; background: linear-gradient(160deg, #3a3a3f 0%, #2b2b2f 100%); box-shadow: 0 24px 50px rgba(43, 43, 47, 0.3); font-family: 'Kit Poppins'; font-weight: 800; font-size: 86px; line-height: 170px; text-align: center; color: #ffffff">★</div>
						<svg id="s1-auvent" style="position: absolute; left: 260px; top: 520px; width: 560px; height: 150px" viewBox="0 0 560 150">
							<path d="M 0 0 H 560 V 90 H 0 Z" fill="#2B2B2F" />
							<g fill="#9E978C"><rect x="70" y="0" width="70" height="90" /><rect x="210" y="0" width="70" height="90" /><rect x="350" y="0" width="70" height="90" /><rect x="490" y="0" width="70" height="90" /></g>
							<g fill="#2B2B2F"><circle cx="35" cy="90" r="35" /><circle cx="175" cy="90" r="35" /><circle cx="315" cy="90" r="35" /><circle cx="455" cy="90" r="35" /></g>
							<g fill="#9E978C"><circle cx="105" cy="90" r="35" /><circle cx="245" cy="90" r="35" /><circle cx="385" cy="90" r="35" /><circle cx="525" cy="90" r="35" /></g>
						</svg>
						<div class="emoji s1-etincelle" style="left: 190px; top: 560px; font-size: 90px">✨</div>
						<div class="emoji s1-etincelle" style="left: 800px; top: 900px; font-size: 80px">✨</div>
						<div class="emoji s1-etincelle" style="left: 210px; top: 1080px; font-size: 70px">✨</div>""",
"""			// Image 0 : la carte est déjà là et se met au point.
			tl.fromTo('#s1-carte', {scale: 0.94}, {scale: 1, duration: 0.8, ease: 'expo.out'}, 0);
			// L'ampoule est là dès l'image 0 et s'allume ; « projet » : le croquis.
			const projet = S.ancre('@projet');
			tl.fromTo('#s1-ampoule', {scale: 0.8, filter: 'brightness(0.85)'}, {scale: 1, filter: 'brightness(1.1)', duration: 0.7, ease: 'expo.out'}, 0);
			kit.cascade(tl, '.s1-trait', projet + 0.1, 0.07);
			// « marque » : le badge se pose en tournant, les couleurs de la marque.
			const marque = S.ancre('@marque');
			tl.fromTo('#s1-badge', {opacity: 0, scale: 1.6, rotation: -25, filter: 'blur(12px)'}, {opacity: 1, scale: 1, rotation: 8, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out'}, marque);
			kit.cascade(tl, '.s1-teinte', marque + 0.15, 0.07);
			// « business » : l'auvent tombe sur la carte, « ouvert ».
			const business = S.ancre('@business');
			kit.chute(tl, '#s1-auvent', business - 0.15, {hauteur: 260});
			kit.entre(tl, '#s1-ouvert', business + 0.25, {dy: 20});
			// « connu » : le halo s'ouvre derrière, les étincelles.
			const connu = S.ancre('@connu');
			tl.fromTo('#s1-halo', {opacity: 0, scale: 0.5}, {opacity: 1, scale: 1.1, duration: 0.8, ease: 'expo.out'}, S.ancre('@merite'));
			kit.cascade(tl, '.s1-etincelle', connu - 0.1, 0.1);""")

# s2 : chaque fois, la même chose.
P["s2-meme-chose"] = page("s2", "Objets : une flèche circulaire qui tourne autour d'un visage épuisé ; le compteur de tentatives grimpe.",
"""						<svg id="s2-boucle" style="position: absolute; left: 270px; top: 550px; width: 540px; height: 540px" viewBox="0 0 540 540">
							<defs><linearGradient id="s2-degrade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B2B2F" /><stop offset="1" stop-color="#B8B1A6" /></linearGradient></defs>
							<path d="M 470 270 A 200 200 0 1 1 400 118" fill="none" stroke="url(#s2-degrade)" stroke-width="36" stroke-linecap="round" />
							<path d="M 360 70 L 430 110 L 380 172 Z" fill="#B8B1A6" stroke="#B8B1A6" stroke-width="10" stroke-linejoin="round" />
						</svg>
						<div id="s2-visage" class="emoji" style="left: 440px; top: 720px; font-size: 200px">😩</div>
						<div class="centre" style="top: 1170px"><span id="s2-essai" class="pilule">essai n° <span id="s2-n">1</span></span></div>""",
"""			// « Mais chaque fois » : la boucle tourne.
			kit.entre(tl, '#s2-boucle', 0.05, {dy: 0, echelle: 0.7});
			tl.fromTo('#s2-boucle', {rotation: 0}, {rotation: 400, duration: S.dur + 0.4, ease: 'none'}, 0);
			kit.entre(tl, '#s2-visage', S.ancre('@chaque'), {dy: 30, echelle: 0.5});
			// Le compteur de tentatives monte jusqu'à « la même chose ».
			kit.entre(tl, '#s2-essai', S.ancre('@fois'), {dy: 30});
			const n = document.querySelector('#s2-n');
			const e = {v: 1};
			tl.fromTo(e, {v: 1}, {v: 7, duration: S.ancre('@chose') - S.ancre('@fois'), ease: 'power1.in', onUpdate: () => (n.textContent = Math.round(e.v))}, S.ancre('@fois'));""")

ROW = """						<div id="s3-l{i}" class="carte-pub" style="left: 190px; top: {y}px; width: 700px; height: 150px; border-radius: 40px">
							<div class="emoji" style="left: 34px; top: 38px; font-size: 76px">{emoji}</div>
							<div style="position: absolute; left: 140px; top: 44px; font-family: 'Kit Inter'; font-weight: 800; font-size: 54px; color: #2b2b2f">{texte}</div>
							<div id="s3-x{i}" style="position: absolute; left: 584px; top: 37px; width: 76px; height: 76px; border-radius: 38px; background: linear-gradient(180deg, #e8655f 0%, #d9534f 100%); color: #ffffff; font-family: 'Kit Inter'; font-weight: 800; font-size: 46px; line-height: 74px; text-align: center">✕</div>
						</div>"""
P["s3-manques"] = page("s3", "Objets : trois lignes (outils, visuel, confiance), barrées une à une d'une croix rouge ; « personne » : un haussement d'épaules.",
"\n".join(ROW.format(i=i, y=y, emoji=e, texte=t) for i, (y, e, t) in enumerate([(470, "🧰", "Les bons outils"), (650, "🎨", "Le bon visuel"), (830, "🤝", "La confiance")], 1)) + """
						<div id="s3-personne" class="emoji" style="left: 450px; top: 1030px; font-size: 180px">🤷</div>""",
"""			// « Pas les bons outils » : ligne 1, croix ; « Pas le bon visuel » : ligne 2, croix.
			kit.entre(tl, '#s3-l1', 0.05, {dx: -80, dy: 0});
			kit.pop(tl, '#s3-x1', S.ancre('@outils'));
			kit.entre(tl, '#s3-l2', S.ancre('@pas#2'), {dx: -80, dy: 0});
			kit.pop(tl, '#s3-x2', S.ancre('@visuel'));
			// « Et surtout… personne à qui faire confiance » : ligne 3, le haussement d'épaules, la croix.
			kit.entre(tl, '#s3-l3', S.ancre('@surtout'), {dx: -80, dy: 0});
			kit.entre(tl, '#s3-personne', S.ancre('@personne'), {dy: 40, echelle: 0.5});
			kit.pop(tl, '#s3-x3', S.ancre('@confiance'));""")

ONGLETS = [("agence pub ?", 170, 760, -6), ("devis site web", 560, 800, 5), ("freelance fiable ?", 210, 900, 4), ("appli pas chère", 520, 960, -5), ("logo + pub ???", 300, 1060, -3)]
P["s4-chercher"] = page("s4", "Objets : la barre de recherche qui tape, les onglets qui s'empilent ; « arrêtez » : tout s'efface, la main « stop ».",
"""						<div id="s4-barre" class="carte-pub" style="left: 140px; top: 560px; width: 800px; height: 130px; border-radius: 65px">
							<div class="emoji" style="left: 40px; top: 32px; font-size: 64px">🔍</div>
							<div id="s4-texte" style="position: absolute; left: 140px; top: 36px; font-family: 'Kit Inter'; font-weight: 700; font-size: 48px; color: #2b2b2f; white-space: nowrap"></div>
						</div>
""" + "\n".join(f"""						<div class="carte-pub s4-onglet" style="left: {x}px; top: {y}px; width: 330px; height: 84px; border-radius: 24px; transform: rotate({r}deg)"><div style="position: absolute; left: 26px; top: 20px; font-family: 'Kit Inter'; font-weight: 700; font-size: 34px; color: #7a7166; white-space: nowrap">{t}</div></div>""" for t, x, y, r in ONGLETS) + """
						<div id="s4-main" class="emoji" style="left: 410px; top: 640px; font-size: 260px">✋</div>
						<div class="centre" style="top: 990px"><span id="s4-stop" class="pilule">STOP</span></div>""",
"""			// « Alors » : on tape, les onglets s'empilent.
			tl.fromTo('#s4-barre', {opacity: 0.6, filter: 'blur(8px)'}, {opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out'}, 0);
			kit.frappe(tl, '#s4-texte', 'agence pub site appli…', 0.05, 0.45);
			tl.fromTo('.s4-onglet', {opacity: 0, y: -60, filter: 'blur(10px)'}, {opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out', stagger: 0.06}, 0.1);
			// « arrêtez » : tout se dissout, la main « stop » se pose.
			const stop = S.ancre('@arretez');
			kit.sort(tl, ['#s4-barre', '.s4-onglet'], stop - 0.1, {dy: 40});
			kit.entre(tl, '#s4-main', stop, {dy: 60, echelle: 1.4});
			kit.entre(tl, '#s4-stop', stop + 0.15, {dy: 30});""")

P["s5-logo"] = page("s5", "Objets : le monogramme GS (fichier du logo) qui se met au point avec un reflet, le nom GIRESSE / DIGITAL STUDIO, puis les trois services.",
"""						<div id="s5-mono" style="position: absolute; left: 335px; top: 470px; width: 410px; height: 432px">
							<img src="assets/marque/monogramme.png" style="width: 100%; height: 100%; filter: drop-shadow(0 30px 40px rgba(60, 50, 40, 0.25))" />
							<div id="s5-reflet" style="position: absolute; inset: 0; background: linear-gradient(105deg, rgba(255, 255, 255, 0) 35%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0) 65%); background-size: 300% 100%; background-position: 100% 0; -webkit-mask-image: url(assets/marque/monogramme.png); -webkit-mask-size: 100% 100%; mask-image: url(assets/marque/monogramme.png); mask-size: 100% 100%"></div>
						</div>
						<img id="s5-nom" src="assets/marque/nom.png" style="position: absolute; left: 230px; top: 940px; width: 620px" />
						<span id="s5-p1" class="pilule" style="left: 150px; top: 1170px; font-size: 40px; padding: 12px 28px 14px">🎬 Pubs</span>
						<span id="s5-p2" class="pilule" style="left: 410px; top: 1170px; font-size: 40px; padding: 12px 28px 14px">🌐 Sites</span>
						<span id="s5-p3" class="pilule taupe" style="left: 668px; top: 1170px; font-size: 40px; padding: 12px 28px 14px">📱 Applis</span>""",
"""			// « GIRESSE » : le monogramme se met au point, le reflet passe ; « Studio » : le nom.
			tl.fromTo('#s5-mono', {opacity: 0, scale: 1.25, filter: 'blur(20px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out'}, 0);
			tl.fromTo('#s5-reflet', {backgroundPosition: '100% 0'}, {backgroundPosition: '0% 0', duration: 0.9, ease: 'power2.inOut'}, 0.45);
			kit.entre(tl, '#s5-nom', S.ancre('@digital'), {dy: 30, echelle: 1});
			// « s'occupe de tout » : les trois services.
			kit.entre(tl, '#s5-p1', S.ancre('@occupe') - 0.15, {dy: 40});
			kit.entre(tl, '#s5-p2', S.ancre('@occupe'), {dy: 40});
			kit.entre(tl, '#s5-p3', S.ancre('@occupe') + 0.15, {dy: 40});""")

POSTS = "".join(f'<div style="height: 280px; margin: 22px; border-radius: 26px; background: {c}"></div>' for c in ["#e9e6df", "#dcd7ce", "#efede8", "#e2ded5", "#e9e6df", "#dcd7ce", "#efede8", "#e2ded5"])
TEL = """						<div id="{id}" class="tel-pub" style="left: 340px; top: 470px">
							<div class="ilot"></div>
							<div class="ecran"{ecran}>
{contenu}
							</div>
						</div>"""
P["s6-pubs"] = page("s6", "Objets : un téléphone dont le fil défile (flou de mouvement), puis s'arrête net sur une pub animée ; cœurs ; le pouce qui ne scrolle plus.",
TEL.format(id="s6-tel", ecran="", contenu=f"""								<div id="s6-fil" style="position: absolute; left: 0; right: 0; top: 60px">{POSTS}</div>
								<div id="s6-pub" style="position: absolute; left: 22px; right: 22px; top: 150px; height: 470px; border-radius: 30px; background: linear-gradient(160deg, #3a3a3f 0%, #2b2b2f 50%, #9e978c 100%); box-shadow: 0 30px 60px rgba(43, 43, 47, 0.4)">
									<div id="s6-produit" class="emoji" style="left: 95px; top: 70px; font-size: 160px">🛍️</div>
									<div style="position: absolute; left: 0; right: 0; top: 300px; text-align: center; font-family: 'Kit Poppins'; font-weight: 800; font-size: 54px; color: #ffffff">NOUVEAU</div>
									<div style="position: absolute; left: 0; right: 0; top: 375px; text-align: center; font-family: 'Kit Inter'; font-weight: 700; font-size: 30px; color: #e4e0d8">Découvrir →</div>
								</div>""") + """
						<div id="s6-pouce" class="emoji" style="left: 700px; top: 980px; font-size: 140px">👆</div>
						<div class="emoji s6-coeur" style="left: 760px; top: 760px; font-size: 70px">❤️</div>
						<div class="emoji s6-coeur" style="left: 820px; top: 820px; font-size: 56px">❤️</div>
						<div class="emoji s6-coeur" style="left: 740px; top: 860px; font-size: 64px">❤️</div>""",
"""			// « des publicités » : le téléphone, le fil défile vite, le pouce pousse.
			kit.entre(tl, '#s6-tel', 0, {dy: 120, echelle: 0.9, duree: 0.7});
			const stop = S.ancre('@arretent');
			tl.fromTo('#s6-fil', {y: 0, filter: 'blur(0px)'}, {y: -1300, filter: 'blur(6px)', duration: stop, ease: 'power1.in'}, 0.1);
			tl.fromTo('#s6-pouce', {y: 0}, {y: -90, duration: 0.3, ease: 'power2.inOut', yoyo: true, repeat: Math.max(1, Math.floor(stop / 0.3) - 1)}, 0.1);
			// « arrêtent le scroll » : la pub s'impose, le fil s'efface, les cœurs montent.
			tl.to('#s6-fil', {opacity: 0, duration: 0.1}, stop);
			tl.fromTo('#s6-pub', {opacity: 0, y: 260, filter: 'blur(14px)'}, {opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}, stop);
			tl.fromTo('#s6-produit', {rotation: -10}, {rotation: 6, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 2}, stop + 0.3);
			kit.monte(tl, '.s6-coeur', S.ancre('@scroll'), S.dur, {dy: -320, cycle: 1.2});""")

P["s7-sites"] = page("s7", "Objets : une boutique en ligne dans un navigateur ; le curseur clique « Acheter », les notifications de vente tombent.",
"""						<div id="s7-site" class="carte-pub" style="left: 200px; top: 460px; width: 740px; height: 560px; border-radius: 36px; overflow: hidden">
							<div style="position: absolute; left: 0; right: 0; top: 0; height: 70px; background: #f3f1ec; border-bottom: 2px solid #e4e0d8"></div>
							<div style="position: absolute; left: 30px; top: 25px; width: 20px; height: 20px; border-radius: 10px; background: #e8655f"></div>
							<div style="position: absolute; left: 62px; top: 25px; width: 20px; height: 20px; border-radius: 10px; background: #f2c14e"></div>
							<div style="position: absolute; left: 94px; top: 25px; width: 20px; height: 20px; border-radius: 10px; background: #34d27a"></div>
							<div style="position: absolute; left: 150px; top: 18px; width: 440px; height: 36px; border-radius: 18px; background: #ffffff; font-family: 'Kit Inter'; font-weight: 700; font-size: 24px; line-height: 36px; color: #9e978c; text-align: center">ta-boutique.fr</div>
							<div style="position: absolute; left: 40px; top: 110px; width: 300px; height: 300px; border-radius: 30px; background: radial-gradient(circle at 50% 40%, #ffffff 0%, #ebe8e1 100%)"></div>
							<div class="emoji" style="left: 80px; top: 170px; font-size: 180px">👟</div>
							<div style="position: absolute; left: 380px; top: 130px; font-family: 'Kit Poppins'; font-weight: 800; font-size: 46px; color: #2b2b2f">Sneakers</div>
							<div style="position: absolute; left: 380px; top: 200px; width: 300px; height: 22px; border-radius: 11px; background: #ebe8e1"></div>
							<div style="position: absolute; left: 380px; top: 240px; width: 230px; height: 22px; border-radius: 11px; background: #ebe8e1"></div>
							<div style="position: absolute; left: 380px; top: 290px; font-family: 'Kit Poppins'; font-weight: 800; font-size: 60px; color: #2b2b2f">49 €</div>
							<div id="s7-acheter" style="position: absolute; left: 380px; top: 430px; width: 310px; height: 86px; border-radius: 43px; background: linear-gradient(180deg, #3a3a3f 0%, #2b2b2f 100%); font-family: 'Kit Inter'; font-weight: 800; font-size: 38px; line-height: 86px; color: #ffffff; text-align: center">Acheter</div>
						</div>
						""" + CURSEUR.format(id="s7-curseur", x=900, y=1150) + """
						<div id="s7-t1" class="toast" style="left: 200px; top: 1060px"><b>💸</b><span>Nouvelle vente<small>à l'instant · 49 €</small></span></div>
						<div id="s7-t2" class="toast" style="left: 230px; top: 1180px"><b>💸</b><span>Nouvelle vente<small>il y a 2 min · 49 €</small></span></div>""",
"""			// « des sites web » : la boutique arrive, le curseur entre par le bas.
			kit.entre(tl, '#s7-site', 0, {dy: 100, echelle: 0.9});
			const vend = S.ancre('@vendent');
			tl.fromTo('#s7-curseur', {x: 200, y: 250, opacity: 0}, {x: -100, y: -190, opacity: 1, duration: 0.45, ease: 'power3.out'}, 0.15);
			// « vendent » : clic sur « Acheter », les ventes tombent.
			tl.to('#s7-acheter', {scale: 0.93, duration: 0.08, ease: 'power2.in', yoyo: true, repeat: 1}, vend - 0.1);
			tl.to('#s7-curseur', {scale: 0.9, duration: 0.08, yoyo: true, repeat: 1}, vend - 0.1);
			kit.entre(tl, '#s7-t1', vend, {dy: -60, echelle: 0.95, duree: 0.5});
			kit.entre(tl, '#s7-t2', S.ancre('@pour'), {dy: -60, echelle: 0.95, duree: 0.5});""")

P["s8-applis"] = page("s8", "Objets : un téléphone en mode nuit (03:12, lune) ; l'appli reçoit des réservations pendant que tu dors.",
TEL.format(id="s8-tel", ecran=' style="background: linear-gradient(180deg, #1f1f24 0%, #2b2b2f 100%)"', contenu="""								<div style="position: absolute; left: 0; right: 0; top: 110px; text-align: center; font-family: 'Kit Poppins'; font-weight: 800; font-size: 120px; color: #ffffff">03:12</div>
								<div style="position: absolute; left: 0; right: 0; top: 260px; text-align: center; font-family: 'Kit Inter'; font-weight: 700; font-size: 30px; color: #b8b1a6">mardi 4 novembre</div>""") + """
						<div id="s8-lune" class="emoji" style="left: 800px; top: 520px; font-size: 120px">🌙</div>
						<div id="s8-t1" class="toast" style="left: 230px; top: 820px"><b>📅</b><span>Nouvelle réservation<small>Ton appli · maintenant</small></span></div>
						<div id="s8-t2" class="toast" style="left: 230px; top: 960px"><b>🛒</b><span>Commande payée<small>Ton appli · 03:11</small></span></div>
						<div id="s8-t3" class="toast" style="left: 230px; top: 1100px"><b>⭐</b><span>Nouvel avis 5 étoiles<small>Ton appli · 03:09</small></span></div>
						<div id="s8-dodo" class="emoji" style="left: 190px; top: 560px; font-size: 130px">😴</div>""",
"""			// « des applications » : le téléphone de nuit, la lune.
			kit.entre(tl, '#s8-tel', 0, {dy: 120, echelle: 0.9, duree: 0.7});
			kit.entre(tl, '#s8-lune', 0.25, {dy: 30, echelle: 0.6});
			// « travaillent » : les notifications tombent l'une après l'autre.
			const travail = S.ancre('@travaillent');
			kit.entre(tl, '#s8-t1', travail, {dy: -70, duree: 0.5});
			kit.entre(tl, '#s8-t2', travail + 0.45, {dy: -70, duree: 0.5});
			kit.entre(tl, '#s8-t3', travail + 0.9, {dy: -70, duree: 0.5});
			// « dormez » : toi, tu dors.
			kit.entre(tl, '#s8-dodo', S.ancre('@dormez'), {dy: 30, echelle: 0.5});""")

YEUX = [(180, 520, 90), (790, 540, 100), (160, 900, 80), (820, 930, 90), (300, 1130, 80), (680, 1150, 90), (480, 450, 70), (880, 730, 70)]
P["s9-ignorer"] = page("s9", "Objets : « Vous » (mallette) et « Nous » (carte anthracite au monogramme, mégaphone) ; puis le monogramme au centre, entouré de regards.",
"""						<div id="s9-vous" class="carte-pub" style="left: 170px; top: 560px; width: 350px; height: 440px">
							<div class="emoji" style="left: 105px; top: 60px; font-size: 140px">💼</div>
							<div style="position: absolute; left: 0; right: 0; top: 250px; text-align: center; font-family: 'Kit Poppins'; font-weight: 800; font-size: 64px; color: #2b2b2f">Vous</div>
							<div style="position: absolute; left: 0; right: 0; top: 340px; text-align: center; font-family: 'Kit Inter'; font-weight: 700; font-size: 32px; color: #7a7166">votre business</div>
						</div>
						<div id="s9-nous" class="carte-pub" style="left: 560px; top: 560px; width: 350px; height: 440px; background: linear-gradient(170deg, #3a3a3f 0%, #2b2b2f 100%)">
							<div class="emoji" style="left: 105px; top: 60px; font-size: 140px">📣</div>
							<div style="position: absolute; left: 0; right: 0; top: 250px; text-align: center; font-family: 'Kit Poppins'; font-weight: 800; font-size: 64px; color: #ffffff">Nous</div>
							<div style="position: absolute; left: 0; right: 0; top: 340px; text-align: center; font-family: 'Kit Inter'; font-weight: 700; font-size: 32px; color: #b8b1a6">la visibilité</div>
						</div>
						<div id="s9-centre" class="carte-pub" style="left: 340px; top: 620px; width: 400px; height: 400px; border-radius: 200px">
							<img src="assets/marque/monogramme.png" style="position: absolute; left: 90px; top: 80px; width: 220px" />
						</div>
""" + "\n".join(f"""						<div class="emoji s9-oeil" style="left: {x}px; top: {y}px; font-size: {t}px">👀</div>""" for x, y, t in YEUX),
"""			// « Vous, vous gérez votre business » : la carte « Vous ».
			kit.entre(tl, '#s9-vous', 0.05, {dx: -80, dy: 0});
			// « Nous » : la carte anthracite.
			kit.entre(tl, '#s9-nous', S.ancre('@nous'), {dx: 80, dy: 0});
			// « impossible à ignorer » : les cartes s'effacent, le monogramme au centre, tous les regards sur lui.
			const imp = S.ancre('@impossible');
			kit.sort(tl, ['#s9-vous', '#s9-nous'], imp - 0.25);
			kit.entre(tl, '#s9-centre', imp, {dy: 0, echelle: 0.6, duree: 0.7});
			tl.fromTo('.s9-oeil', {opacity: 0, scale: 0.3, filter: 'blur(8px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'back.out(1.6)', stagger: 0.08}, S.ancre('@ignorer') - 0.2);""")

P["s10-whatsapp"] = page("s10", "Objets : le logo GIRESSE (monogramme et nom, fichiers du logo), puis le bouton vert « Écrivez-nous sur WhatsApp » (bulle dessinée) ; le curseur clique.",
"""						<img id="s10-mono" src="assets/marque/monogramme.png" style="position: absolute; left: 375px; top: 450px; width: 350px; filter: drop-shadow(0 30px 40px rgba(60, 50, 40, 0.25))" />
						<img id="s10-nom" src="assets/marque/nom.png" style="position: absolute; left: 250px; top: 840px; width: 580px" />
						<div id="s10-bouton" style="position: absolute; left: 160px; top: 1070px; width: 760px; height: 140px; border-radius: 70px; background: linear-gradient(180deg, #1fa855 0%, #168a45 100%); box-shadow: 0 30px 60px rgba(22, 138, 69, 0.35)">
							<svg style="position: absolute; left: 44px; top: 32px; width: 76px; height: 76px" viewBox="0 0 76 76"><path d="M 38 6 A 32 32 0 1 1 20 64 L 6 70 L 11 56 A 32 32 0 0 1 38 6 Z" fill="#FFFFFF" /><path d="M 26 26 Q 26 46 50 52" fill="none" stroke="#168A45" stroke-width="7" stroke-linecap="round" /></svg>
							<div style="position: absolute; left: 136px; top: 44px; font-family: 'Kit Inter'; font-weight: 800; font-size: 40px; color: #ffffff; white-space: nowrap">Écrivez-nous sur WhatsApp</div>
						</div>
						""" + CURSEUR.format(id="s10-curseur", x=850, y=1150),
"""			// « GIRESSE Digital Studio » : le logo se pose, le nom suit.
			tl.fromTo('#s10-mono', {opacity: 0, scale: 0.8, filter: 'blur(18px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out'}, 0);
			kit.entre(tl, '#s10-nom', S.ancre('@digital'), {dy: 30, echelle: 1});
			// « Écrivez-nous sur WhatsApp » : le bouton ; le curseur arrive.
			kit.entre(tl, '#s10-bouton', S.ancre('@ecriveznous'), {dy: 80, echelle: 0.9});
			tl.fromTo('#s10-curseur', {x: 260, y: 300, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out'}, S.ancre('@whatsapp'));
			// « Aujourd'hui » : le clic.
			const auj = S.ancre('@aujourdhui');
			tl.to('#s10-bouton', {scale: 0.95, duration: 0.09, ease: 'power2.in', yoyo: true, repeat: 1}, auj);
			tl.to('#s10-curseur', {scale: 0.88, duration: 0.09, yoyo: true, repeat: 1}, auj);""")

for nom, contenu in P.items():
    open(os.path.join(DOSSIER, f"{nom}.html"), "w").write(contenu)

# Calque : les étapes 1, 2, 3 des services, à gauche, pendant les scènes 6 à 8.
ETAPES = """<template>
	<style>
		#root {
			position: absolute;
			inset: 0;
		}
		/* Police déjà déclarée dans kit.css ; répétée ici pour le contrôle HyperFrames. */
		@font-face {
			font-family: 'Kit Inter';
			font-weight: 800;
			src: url('assets/kit/fonts/inter-800.woff2') format('woff2');
		}
		.etape {
			position: absolute;
			left: 70px;
			width: 76px;
			height: 76px;
			border-radius: 38px;
			background: #e4e0d8;
			color: #5f574d;
			font-family: 'Kit Inter';
			font-weight: 800;
			font-size: 38px;
			line-height: 76px;
			text-align: center;
			box-shadow: 0 12px 24px rgba(60, 50, 40, 0.15);
		}
	</style>
	<div id="root" data-composition-id="etapes" data-width="1080" data-height="1920">
		<!-- Les trois services : pubs, sites, applis ; l'étape en cours en anthracite, les étapes faites en vert. -->
		<div id="etapes-boite" style="position: absolute; inset: 0; opacity: 0">
			<div id="e1" class="etape" style="top: 700px">1</div>
			<div id="e2" class="etape" style="top: 810px">2</div>
			<div id="e3" class="etape" style="top: 920px">3</div>
		</div>
	</div>
	<script>
		(function () {
			const C = kit.calque('etapes');
			const tl = C.tl;
			const actif = {background: '#2b2b2f', color: '#ffffff', scale: 1.12, duration: 0.25, ease: 'expo.out'};
			const fait = {background: '#168a45', color: '#ffffff', scale: 1, duration: 0.25, ease: 'expo.out'};
			// « des publicités » : les étapes arrivent, la 1 s'allume.
			tl.fromTo('#etapes-boite', {opacity: 0, x: -40, filter: 'blur(10px)'}, {opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out'}, C.ancre('@publicites'));
			tl.to('#e1', actif, C.ancre('@publicites'));
			// « sites » : 1 faite, 2 en cours ; « applications » : 2 faite, 3 en cours ; « dormez » : 3 faite.
			tl.to('#e1', fait, C.ancre('@sites'));
			tl.to('#e2', actif, C.ancre('@sites'));
			tl.to('#e2', fait, C.ancre('@applications'));
			tl.to('#e3', actif, C.ancre('@applications'));
			tl.to('#e3', fait, C.ancre('@dormez'));
			// « Vous, vous gérez » : elles s'en vont.
			tl.to('#etapes-boite', {opacity: 0, x: -40, filter: 'blur(10px)', duration: 0.25, ease: 'power3.in'}, C.ancre('@gerez') - 0.4);
			C.fin();
		})();
	</script>
</template>
"""
open(os.path.join(DOSSIER, "etapes.html"), "w").write(ETAPES)
print("ok", len(P) + 1)
