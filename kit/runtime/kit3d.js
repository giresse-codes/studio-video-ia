// Style « 3D pâte à modeler » (STYLE.md) : Three.js dans HyperFrames.
// Chaque image est calculée à partir de son numéro (événement hf-seek du runtime, arrondi à l'image) :
// aucune horloge, aucun hasard non semé. Copié dans chaque vidéo par `npm run preparer`.
(function () {
	const K = () => window.KIT;

	// Couleurs pastel de STYLE.md (Atelier, Schéma), pour les matériaux mats.
	const PASTELS = {
		mur: '#D8B7A4',
		sol: '#B8A9D6',
		verre: '#7CC8F0',
		metal: '#BFC5CC',
		beige: '#EBDDBB',
		vert: '#6FCF7A',
		rouge: '#E86A6C',
		jaune: '#FFD27A',
		blanc: '#FBF7F0',
		encre: '#2A2A33',
		nuit: '#2A3A5C',
	};

	const lisse = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
	const sortie = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

	const kit3d = {
		PASTELS,

		// Crée la scène 3D d'une scène HyperFrames. `S` vient de kit.scene(id, {travelling: false}).
		// options.camera : {de: [x,y,z], a: [x,y,z], cible: [x,y,z], fov} — travelling de `de` vers `a` sur toute la scène.
		creer(S, {toile, ciel = '#F3E9DC', brouillard = null, camera = {}} = {}) {
			const THREE = window.THREE;
			const canvas = typeof toile === 'string' ? document.getElementById(toile) : toile;
			const {largeur, hauteur, ips} = {largeur: 1080, hauteur: 1920, ips: K().fps};
			const debut = K().scenes.find((s) => s.id === S.id).debut;

			const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true, alpha: false});
			renderer.setPixelRatio(1);
			renderer.setSize(largeur, hauteur, false);
			renderer.outputEncoding = THREE.sRGBEncoding;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			renderer.localClippingEnabled = true;

			const scene = new THREE.Scene();
			scene.background = new THREE.Color(ciel);
			if (brouillard) scene.fog = new THREE.Fog(brouillard.couleur, brouillard.de, brouillard.a);

			// Lumière douce : ciel/sol + soleil chaud avec ombres floues.
			const hemi = new THREE.HemisphereLight('#FFF6E8', '#B8A9D6', 0.85);
			scene.add(hemi);
			const soleil = new THREE.DirectionalLight('#FFF1DC', 0.95);
			soleil.position.set(4, 9, 7);
			soleil.castShadow = true;
			soleil.shadow.mapSize.set(2048, 2048);
			soleil.shadow.camera.left = -8;
			soleil.shadow.camera.right = 8;
			soleil.shadow.camera.top = 8;
			soleil.shadow.camera.bottom = -8;
			soleil.shadow.camera.near = 1;
			soleil.shadow.camera.far = 30;
			soleil.shadow.bias = -0.0008;
			soleil.shadow.radius = 6;
			scene.add(soleil);

			const cam = new THREE.PerspectiveCamera(camera.fov ?? 38, largeur / hauteur, 0.1, 100);
			const de = new THREE.Vector3(...(camera.de ?? [0, 3, 14]));
			const a = new THREE.Vector3(...(camera.a ?? [0, 2.6, 12.5]));
			const cibleBase = new THREE.Vector3(...(camera.cible ?? [0, 1.5, 0]));

			const zooms = [];
			const suivis = [];
			const importants = [];
			const animations = [];
			const ctx = {
				THREE,
				scene,
				camera: cam,
				renderer,
				soleil,
				hemi,

				// Matériau mat « pâte à modeler ».
				mat(couleur, {rugosite = 0.88, emissive = null, intensite = 0, transparent = false, opacite = 1, coupe = null} = {}) {
					const m = new THREE.MeshStandardMaterial({color: PASTELS[couleur] ?? couleur, roughness: rugosite, metalness: 0, transparent, opacity: opacite});
					if (emissive) {
						m.emissive = new THREE.Color(PASTELS[emissive] ?? emissive);
						m.emissiveIntensity = intensite;
					}
					if (coupe) m.clippingPlanes = [coupe];
					return m;
				},

				// Boîte aux arêtes arrondies (forme de base), centrée sur son origine.
				boite(l, h, p, {rayon = 0.12, couleur = 'blanc', materiau = null} = {}) {
					const r = Math.min(rayon, l / 2 - 0.001, h / 2 - 0.001, p / 2 - 0.001);
					// Rectangle aux coins arrondis, extrudé avec un biseau arrondi : toutes les arêtes sont douces.
					const forme = new THREE.Shape();
					const x = -l / 2 + r;
					const y = -h / 2 + r;
					const w = l - 2 * r;
					const hh = h - 2 * r;
					const c = Math.min(r, w / 2, hh / 2) * 0.8;
					forme.moveTo(x + c, y);
					forme.lineTo(x + w - c, y);
					forme.quadraticCurveTo(x + w, y, x + w, y + c);
					forme.lineTo(x + w, y + hh - c);
					forme.quadraticCurveTo(x + w, y + hh, x + w - c, y + hh);
					forme.lineTo(x + c, y + hh);
					forme.quadraticCurveTo(x, y + hh, x, y + hh - c);
					forme.lineTo(x, y + c);
					forme.quadraticCurveTo(x, y, x + c, y);
					const geo = new THREE.ExtrudeGeometry(forme, {depth: Math.max(0.001, p - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 5, curveSegments: 6});
					geo.translate(0, 0, -(p - 2 * r) / 2);
					geo.computeVertexNormals();
					return ctx.maille(geo, materiau ?? ctx.mat(couleur));
				},
				cylindre(rayon, h, {couleur = 'blanc', materiau = null, segments = 40, rayonHaut = null} = {}) {
					return ctx.maille(new THREE.CylinderGeometry(rayonHaut ?? rayon, rayon, h, segments), materiau ?? ctx.mat(couleur));
				},
				sphere(rayon, {couleur = 'blanc', materiau = null} = {}) {
					return ctx.maille(new THREE.SphereGeometry(rayon, 40, 24), materiau ?? ctx.mat(couleur));
				},
				maille(geo, materiau) {
					const m = new THREE.Mesh(geo, materiau);
					m.castShadow = true;
					m.receiveShadow = true;
					return m;
				},
				groupe(...enfants) {
					const g = new THREE.Group();
					enfants.forEach((e) => g.add(e));
					return g;
				},
				// Sol qui reçoit les ombres.
				sol(couleur = 'beige', taille = 40) {
					const m = ctx.maille(new THREE.PlaneGeometry(taille, taille), ctx.mat(couleur, {rugosite: 1}));
					m.rotation.x = -Math.PI / 2;
					m.castShadow = false;
					scene.add(m);
					return m;
				},
				// Plan de coupe : ne garde que ce qui est du côté `normale` (vue en coupe d'un objet).
				coupe(normale, distance) {
					return new THREE.Plane(new THREE.Vector3(...normale), distance);
				},

				// Animation d'un objet, fonction pure du temps local : fn(objet, t) appelée à chaque image.
				animer(objet, fn) {
					animations.push({objet, fn});
				},

				// Zoom rapide (125 % en 0,25 s) vers un point 3D, sur le mot, puis retour doux.
				zoomMot(brute, cible) {
					zooms.push({t: S.ancre(brute), cible: new THREE.Vector3(...cible)});
				},

				// Une étiquette 2D (élément HTML) suit un point 3D, décalée de [dx, dy] px.
				suivre(element, point, decalage = [0, 0]) {
					suivis.push({el: typeof element === 'string' ? document.querySelector(element) : element, point: new THREE.Vector3(...point), decalage});
				},

				// Objet important : `npm run verifier` contrôle qu'il reste à 60 px des bords.
				important(nom, objet) {
					importants.push({nom, objet});
				},
			};

			const {echelle, dureeSec} = K().zoomMot;
			const [trDe, trA] = K().travelling;
			const ecran = new THREE.Vector3();
			const boite3 = new THREE.Box3();

			// Calcule l'image `n` (numéro d'image dans la vidéo) : tout vient de ce nombre.
			const image = (n) => {
				const t = n / ips - debut;
				const p = lisse(Math.min(1, Math.max(0, t / S.dur)));
				cam.position.lerpVectors(de, a, p);
				let zoom = trDe + (trA - trDe) * p;
				const vise = cibleBase.clone();
				for (const z of zooms) {
					const dt = t - z.t;
					if (dt < 0) continue;
					const f = dt < dureeSec ? sortie(dt / dureeSec) : dt < 0.9 ? 1 : 1 - lisse((dt - 0.9) / 0.5);
					zoom *= 1 + (echelle - 1) * f;
					vise.lerp(z.cible, 0.7 * f);
				}
				cam.zoom = zoom;
				cam.lookAt(vise);
				cam.updateProjectionMatrix();
				for (const an of animations) an.fn(an.objet, t);
				scene.updateMatrixWorld(true);
				renderer.render(scene, cam);

				for (const s of suivis) {
					ecran.copy(s.point).project(cam);
					s.el.style.left = `${((ecran.x + 1) / 2) * largeur + s.decalage[0]}px`;
					s.el.style.top = `${((1 - ecran.y) / 2) * hauteur + s.decalage[1]}px`;
				}
				// Boîtes à l'écran des objets importants, lues par npm run verifier.
				window.__kit3d = window.__kit3d || {};
				window.__kit3d[S.id] = {
					temps: t,
					boites: importants.map(({nom, objet}) => {
						// Seulement les parties visibles (un objet caché, ou pas encore tombé, ne compte pas).
						boite3.makeEmpty();
						const morceau = new THREE.Box3();
						objet.traverseVisible((m) => {
							if (!m.isMesh) return;
							if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
							boite3.union(morceau.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld));
						});
						if (boite3.isEmpty()) return {nom, vide: true};
						let x0 = Infinity;
						let y0 = Infinity;
						let x1 = -Infinity;
						let y1 = -Infinity;
						for (const cx of [boite3.min.x, boite3.max.x])
							for (const cy of [boite3.min.y, boite3.max.y])
								for (const cz of [boite3.min.z, boite3.max.z]) {
									ecran.set(cx, cy, cz).project(cam);
									const sx = ((ecran.x + 1) / 2) * largeur;
									const sy = ((1 - ecran.y) / 2) * hauteur;
									x0 = Math.min(x0, sx);
									y0 = Math.min(y0, sy);
									x1 = Math.max(x1, sx);
									y1 = Math.max(y1, sy);
								}
						return {nom, x0, y0, x1, y1};
					}),
				};
			};

			ctx.demarrer = () => {
				// Adaptateur de frames : le runtime donne l'heure de l'image, on la ramène au numéro d'image.
				window.addEventListener('hf-seek', (e) => {
					const n = Math.round(Number(e.detail.time) * ips);
					const t = n / ips - debut;
					if (t > -0.5 && t < S.dur + 1) image(n);
				});
				image(Math.round(debut * ips));
			};
			return ctx;
		},
	};

	window.kit3d = kit3d;
})();
