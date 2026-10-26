// Kit d'animation des vidéos du studio (HyperFrames + GSAP). Copié dans chaque vidéo par `npm run preparer`.
// Tout est fonction du temps de la timeline : aucune horloge, aucun hasard non semé.
// Les heures viennent des ancres (@mot), résolues à la préparation dans window.KIT.ancres.
(function () {
	const K = () => window.KIT;

	// Transitions d'entrée et de sortie, sur la boîte .stage de la scène (jamais de coupe sèche).
	const TRANSITIONS = {
		zoom: {
			entree(tl, stage, d) {
				tl.fromTo(stage, {opacity: 0, scale: 0.6, filter: 'blur(12px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: d, ease: 'expo.out'}, 0);
			},
			sortie(tl, stage, t, d) {
				tl.to(stage, {opacity: 0, scale: 1.7, filter: 'blur(14px)', duration: d, ease: 'power3.in'}, t);
			},
		},
		balayage: {
			entree(tl, stage, d) {
				tl.fromTo(stage, {clipPath: 'inset(0% 0% 0% 100%)', x: 160, filter: 'blur(10px)'}, {clipPath: 'inset(0% 0% 0% 0%)', x: 0, filter: 'blur(0px)', duration: d, ease: 'power3.out'}, 0);
			},
			sortie(tl, stage, t, d) {
				tl.to(stage, {x: -320, opacity: 0, filter: 'blur(12px)', duration: d, ease: 'power3.in'}, t);
			},
		},
	};

	const kit = {
		// Prépare une scène : timeline, transitions, travelling lent, parallaxe des trois plans.
		// Usage : const S = kit.scene('s2'); … S.fin();
		// Scène 3D : kit.scene('s2', {travelling: false}) — la caméra 3D fait le travelling (kit3d).
		scene(id, {travelling = true} = {}) {
			const scenes = K().scenes;
			const k = scenes.findIndex((s) => s.id === id);
			if (k === -1) throw new Error(`Scène ${id} absente de video.json : relancer npm run preparer`);
			const data = scenes[k];
			const suivante = scenes[k + 1];
			const stage = document.getElementById(`${id}-stage`);
			const q = (sel) => stage.querySelector(sel);
			const tl = gsap.timeline({paused: true});
			const dur = data.fin - data.debut;
			const d = K().transitionSec;

			if (k > 0) (TRANSITIONS[data.transition] || TRANSITIONS.zoom).entree(tl, stage, d);
			if (suivante) (TRANSITIONS[suivante.transition] || TRANSITIONS.zoom).sortie(tl, stage, dur, d);

			// Travelling lent 100 → 112 % sur toute la scène, et dérive des plans à des vitesses différentes.
			if (travelling) {
				const [de, a] = K().travelling;
				tl.fromTo(q('.cam'), {scale: de}, {scale: a, duration: dur + d, ease: 'sine.inOut'}, 0);
				tl.fromTo(q('.fond'), {x: 0}, {x: -24, duration: dur + d, ease: 'sine.inOut'}, 0);
				tl.fromTo(q('.objets'), {x: 0}, {x: -50, duration: dur + d, ease: 'sine.inOut'}, 0);
				tl.fromTo(q('.avant'), {x: 0}, {x: -130, duration: dur + d, ease: 'sine.inOut'}, 0);
			}

			let zooms = 0;
			const S = {
				id,
				tl,
				dur,
				stage,
				// Heure locale (s) de l'événement lié à un mot : '@chaleur', '@chaleur#2', '@chauff*', '@chaleur+0.1'.
				ancre(brute) {
					const abs = K().ancres[`${id}|${brute}`];
					if (abs === undefined) throw new Error(`Ancre ${brute} non préparée pour ${id} : relancer npm run preparer`);
					return Math.max(0, abs - data.debut);
				},
				// Zoom rapide (125 % en 0,25 s) vers l'objet, sur le mot clé, puis retour doux.
				zoomMot(brute, cible) {
					const t = S.ancre(brute);
					const [x, y] = cible || data.cible;
					const {echelle, dureeSec} = K().zoomMot;
					tl.fromTo(q('.punch'), {scale: 1}, {scale: echelle, duration: dureeSec, ease: 'power3.out', transformOrigin: `${x}px ${y}px`, immediateRender: zooms === 0}, t);
					tl.to(q('.punch'), {scale: 1, duration: 0.5, ease: 'power2.inOut'}, t + 0.9);
					zooms++;
				},
				fin() {
					window.__timelines = window.__timelines || {};
					window.__timelines[id] = tl;
				},
			};
			return S;
		},

		// Apparition avec rebond, écrasement puis étirement.
		pop(tl, cible, t, {echelle = 1} = {}) {
			tl.fromTo(cible, {opacity: 0, scale: 0, transformOrigin: '50% 100%'}, {opacity: 1, scale: echelle, duration: 0.42, ease: 'back.out(2.4)'}, t);
			tl.to(cible, {scaleX: echelle * 1.14, scaleY: echelle * 0.86, duration: 0.09, ease: 'power2.out'}, t + 0.3);
			tl.to(cible, {scaleX: echelle, scaleY: echelle, duration: 0.34, ease: 'elastic.out(1, 0.45)'}, t + 0.39);
		},

		// Chute, écrasement à l'atterrissage, étirement, repos.
		chute(tl, cible, t, {hauteur = 320} = {}) {
			tl.fromTo(cible, {opacity: 0, y: -hauteur, scaleX: 0.9, scaleY: 1.12, transformOrigin: '50% 100%'}, {opacity: 1, y: 0, duration: 0.38, ease: 'power3.in'}, t);
			tl.to(cible, {scaleX: 1.22, scaleY: 0.78, duration: 0.08, ease: 'power2.out'}, t + 0.38);
			tl.to(cible, {scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)'}, t + 0.46);
		},

		// Étiquette tamponnée : arrive grande et inclinée, se pose avec un rebond.
		tampon(tl, cible, t) {
			tl.fromTo(cible, {opacity: 0, scale: 1.7, rotation: -8}, {opacity: 1, scale: 1, rotation: -2, duration: 0.32, ease: 'back.out(3)'}, t);
		},

		// Trait ou flèche SVG qui se dessine ; invisible avant son départ.
		trace(tl, cibles, t, duree = 0.6, ease = 'power2.inOut') {
			const liste = typeof cibles === 'string' ? document.querySelectorAll(cibles) : [].concat(cibles);
			liste.forEach((el) => {
				const l = el.getTotalLength();
				tl.fromTo(el, {strokeDasharray: l, strokeDashoffset: l, opacity: 0}, {strokeDashoffset: 0, duration: duree, ease}, t);
				tl.set(el, {opacity: 1}, t);
			});
		},

		// Texte qui s'écrit lettre par lettre (frappe), sur la durée donnée.
		frappe(tl, cible, texte, t, duree = 0.6) {
			const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
			const etat = {n: 0};
			el.textContent = '';
			tl.fromTo(etat, {n: 0}, {n: texte.length, duration: duree, ease: 'none', onUpdate: () => (el.textContent = texte.slice(0, Math.round(etat.n)))}, t);
		},

		// Cascade : chaque élément entre `ecart` secondes après le précédent.
		cascade(tl, cibles, t, ecart = 0.08) {
			tl.fromTo(cibles, {opacity: 0, y: 40, scale: 0.6}, {opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: ecart}, t);
		},

		// Boucle aller-retour finie entre t0 et t1 (jamais `repeat: -1`).
		boucle(tl, cible, vars, t0, t1, cycle) {
			const repeat = Math.max(0, Math.floor((t1 - t0) / cycle) - 1);
			tl.to(cible, {...vars, duration: cycle / 2, ease: 'sine.inOut', yoyo: true, repeat: repeat * 2 + 1}, t0);
		},

		// Montée qui s'efface en continu (vapeur, chaleur, bulles), copies décalées.
		monte(tl, cibles, t0, t1, {dy = -260, cycle = 1.6} = {}) {
			const liste = typeof cibles === 'string' ? document.querySelectorAll(cibles) : cibles;
			liste.forEach((el, i) => {
				const decalage = (cycle / liste.length) * i;
				const repeat = Math.max(0, Math.floor((t1 - t0 - decalage) / cycle) - 1);
				tl.fromTo(
					el,
					{y: 0, opacity: 0, scale: 0.7},
					{
						keyframes: [
							{opacity: 1, scale: 0.9, y: dy * 0.2, duration: cycle * 0.25, ease: 'power1.out'},
							{opacity: 0, scale: 1.2, y: dy, duration: cycle * 0.75, ease: 'power1.in'},
						],
						repeat,
					},
					t0 + decalage,
				);
			});
		},
	};

	window.kit = kit;
})();
