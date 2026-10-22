// Outils d'animation partagés par les scènes d'Astuces #1 (GSAP, temps local à la scène).
// Tout est une fonction du temps de la timeline : aucune horloge, aucun hasard non semé.
(function () {
	const normalize = (s) =>
		s
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9]/g, '');

	const kit = {
		// Bornes de la scène k (0 à 8) : {start, end, dur}, en secondes absolues.
		scene(k) {
			const s = window.A1.scenes[k];
			return {start: s.start, end: s.end, dur: s.end - s.start};
		},

		// Temps local (s) du premier mot de la scène qui commence par `prefix`, sinon la fraction de repli.
		word(k, prefix, fallbackFraction, nth = 0) {
			const {start, end, dur} = kit.scene(k);
			const w = window.A1.words.filter((x) => x.start >= start - 0.05 && x.start < end && normalize(x.text).startsWith(prefix))[nth];
			return w ? Math.max(0, w.start - start) : dur * fallbackFraction;
		},

		// Caméra : chaque plan dérive d'une quantité différente (parallaxe), du début à la fin de la scène.
		parallax(tl, stage, dur, {bg = 20, mid = 45, fg = 110, zoom = 1.06, dir = 1} = {}) {
			const q = (s) => stage.querySelector(s);
			tl.fromTo(q('.cam'), {scale: 1}, {scale: zoom, duration: dur, ease: 'power1.inOut'}, 0);
			tl.fromTo(q('.bg'), {x: 0}, {x: -bg * dir, duration: dur, ease: 'power1.inOut'}, 0);
			tl.fromTo(q('.mid'), {x: 0}, {x: -mid * dir, duration: dur, ease: 'power1.inOut'}, 0);
			tl.fromTo(q('.fg'), {x: 0}, {x: -fg * dir, duration: dur, ease: 'power1.inOut'}, 0);
		},

		// Entrée de scène (flou qui se dissipe) et sortie (glissé flou), sur la boîte .stage.
		// `from: 'none'` : la scène est déjà là à la première image (vignette, accroche).
		enterExit(tl, stage, dur, {from = 'right'} = {}) {
			const cam = stage;
			const dx = from === 'right' ? 140 : from === 'left' ? -140 : 0;
			const dy = from === 'down' ? 140 : 0;
			if (from !== 'none') {
				tl.fromTo(cam, {opacity: 0, x: dx, y: dy, filter: 'blur(14px)'}, {opacity: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'expo.out'}, 0);
			}
			tl.to(cam, {opacity: 0, x: -dx * 0.8, y: -dy * 0.5, filter: 'blur(12px)', duration: 0.3, ease: 'power3.in'}, dur);
		},

		// Apparition avec rebond, écrasement puis étirement.
		pop(tl, target, t, {scale = 1, y = 0} = {}) {
			tl.fromTo(target, {opacity: 0, scale: 0, y: y + 30, transformOrigin: '50% 100%'}, {opacity: 1, scale, y, duration: 0.42, ease: 'back.out(2.4)'}, t);
			tl.to(target, {scaleX: scale * 1.14, scaleY: scale * 0.86, duration: 0.09, ease: 'power2.out'}, t + 0.3);
			tl.to(target, {scaleX: scale, scaleY: scale, duration: 0.34, ease: 'elastic.out(1, 0.45)'}, t + 0.39);
		},

		// Chute depuis le haut, écrasement à l'atterrissage, étirement, repos.
		drop(tl, target, t, {height = 300} = {}) {
			tl.fromTo(target, {opacity: 0, y: -height, scaleX: 0.9, scaleY: 1.12, transformOrigin: '50% 100%'}, {opacity: 1, y: 0, duration: 0.38, ease: 'power3.in'}, t);
			tl.to(target, {scaleX: 1.22, scaleY: 0.78, duration: 0.08, ease: 'power2.out'}, t + 0.38);
			tl.to(target, {scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)'}, t + 0.46);
		},

		// Étiquette tamponnée : arrive grande et inclinée, se pose avec un petit rebond.
		stamp(tl, target, t) {
			tl.fromTo(target, {opacity: 0, scale: 1.7, rotation: -8}, {opacity: 1, scale: 1, rotation: -2, duration: 0.32, ease: 'back.out(3)'}, t);
		},

		// Tracé qui se dessine (chemins SVG) ; la longueur est mesurée une fois, avant les tweens.
		draw(tl, targets, t, duration = 0.6, ease = 'power2.inOut') {
			const list = typeof targets === 'string' ? document.querySelectorAll(targets) : [].concat(targets);
			list.forEach((el) => {
				const len = el.getTotalLength();
				// Invisible avant son départ : sinon le bout arrondi du trait apparaît comme un point.
				tl.fromTo(el, {strokeDasharray: len, strokeDashoffset: len, opacity: 0}, {strokeDashoffset: 0, duration, ease}, t);
				tl.set(el, {opacity: 1}, t);
			});
		},

		// Cascade : chaque élément entre `gap` secondes après le précédent.
		cascade(tl, targets, t, gap = 0.08, vars = {}) {
			tl.fromTo(
				targets,
				{opacity: 0, y: 40, scale: 0.6},
				{opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: gap, ...vars},
				t,
			);
		},

		// Boucle finie entre t0 et t1 (aller-retour), jamais `repeat: -1`.
		loop(tl, target, vars, t0, t1, cycle) {
			const repeat = Math.max(0, Math.floor((t1 - t0) / cycle) - 1);
			tl.to(target, {...vars, duration: cycle / 2, ease: 'sine.inOut', yoyo: true, repeat: repeat * 2 + 1}, t0);
		},

		// Montée continue qui s'efface (vapeur, chaleur, Zzz) : `count` copies décalées.
		rise(tl, targets, t0, t1, {dy = -260, cycle = 1.6} = {}) {
			const list = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
			list.forEach((el, i) => {
				const offset = (cycle / list.length) * i;
				const repeat = Math.max(0, Math.floor((t1 - t0 - offset) / cycle) - 1);
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
					t0 + offset,
				);
			});
		},
	};

	window.kit = kit;
})();
