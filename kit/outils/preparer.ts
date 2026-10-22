// npm run preparer -- <video>      (ex. : npm run preparer -- astuces-002)
// Calcule l'heure de chaque mot, résout les ancres @mot des scènes, puis écrit dans hyperframes/<video>/ :
// index.html (racine), compositions/sous-titres.html, compositions/avatar.html, assets/kit, assets/sons, assets/audio.
// Options : KIT_WHISPER=non pour sauter Whisper (estimation directe, plus rapide).
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {pagesByWordCount} from '../../src/lib/caption-pages';
import {AVATAR, FORMAT, MOUVEMENT, SCENE_BAS, SON, SOUS_TITRES, SYNCHRO} from '../config';
import {ancresDansCode, type AncreResolue, resoudreAncre} from './ancres';
import {calculerMinutage, type Minutage} from './minutage';
import {CRETE_FICHIER_DB, genererSons, SONS} from './sons';
import {chargerVideo, dossierVideo, type Video} from './video';

const RACINE = path.resolve(import.meta.dirname, '../..');
const r = (x: number) => Math.round(x * 1000) / 1000;

export type Preparation = {
	video: Video;
	minutage: Minutage;
	scenes: {id: string; fichier: string; debut: number; fin: number; transition: string; cible: [number, number]; ancreDebut: string}[];
	ancres: (AncreResolue & {scene: string})[];
	bruitages: {sec: number; son: string; cause: string}[];
};

// Résout tout ce qui dépend du temps : début des scènes, ancres du code, bruitages.
export const resoudre = (video: Video, minutage: Minutage): Preparation => {
	const dossier = dossierVideo(video.id);
	const erreurs: string[] = [];
	const debuts: number[] = [];
	video.scenes.forEach((s, k) => {
		try {
			debuts.push(k === 0 ? 0 : resoudreAncre(s.debut, minutage.mots, debuts[k - 1]).sec);
		} catch (e) {
			erreurs.push(`${s.id} (début) : ${(e as Error).message}`);
			debuts.push(debuts[k - 1] ?? 0);
		}
	});
	const scenes = video.scenes.map((s, k) => ({
		id: s.id,
		fichier: s.fichier,
		debut: debuts[k],
		fin: k === video.scenes.length - 1 ? minutage.dureeSec : debuts[k + 1],
		transition: s.transition ?? 'zoom',
		cible: s.cible,
		ancreDebut: k === 0 ? '@0' : s.debut,
	}));

	const ancres: Preparation['ancres'] = [];
	for (const s of scenes) {
		const code = readFileSync(path.join(dossier, s.fichier), 'utf8');
		for (const brute of ancresDansCode(code)) {
			try {
				ancres.push({...resoudreAncre(brute, minutage.mots, s.debut), scene: s.id});
			} catch (e) {
				erreurs.push(`${s.id} : ${(e as Error).message}`);
			}
		}
	}

	// Bruitages : un son court à 0,2 s, un whoosh à chaque transition, puis ceux déclarés (gags).
	const bruitages: Preparation['bruitages'] = [{sec: SYNCHRO.premierSonSec, son: 'pop-1', cause: 'premier son'}];
	scenes.slice(1).forEach((s, i) => bruitages.push({sec: Math.max(0, s.debut - 0.05), son: `whoosh-${(i % 3) + 1}`, cause: `transition vers ${s.id}`}));
	for (const b of video.bruitages ?? []) {
		const scene = scenes.find((s) => s.id === b.scene);
		try {
			const a = resoudreAncre(b.ancre, minutage.mots, scene?.debut ?? 0);
			bruitages.push({sec: a.sec, son: b.son, cause: `${b.ancre}${b.scene ? ` (${b.scene})` : ''}`});
		} catch (e) {
			erreurs.push(`bruitage ${b.son} : ${(e as Error).message}`);
		}
	}
	for (const b of bruitages) {
		if (!SONS[b.son]) erreurs.push(`bruitage inconnu « ${b.son} » (disponibles : ${Object.keys(SONS).join(', ')})`);
	}
	if (erreurs.length > 0) {
		throw new Error(`Préparation impossible :\n- ${erreurs.join('\n- ')}`);
	}
	bruitages.sort((a, b) => a.sec - b.sec);
	return {video, minutage, scenes, ancres, bruitages};
};

const copier = (de: string, vers: string) => {
	mkdirSync(path.dirname(vers), {recursive: true});
	copyFileSync(de, vers);
};

const ecrireSousTitres = (p: Preparation) => {
	const pages = pagesByWordCount(
		p.minutage.mots.map((w) => ({text: w.text, startMs: w.start * 1000, endMs: w.end * 1000, sentence: w.phrase})),
		SOUS_TITRES.motsParGroupe,
	);
	const groupes = pages.map((page, g) => {
		const suivante = pages[g + 1];
		const fin = page.tokens[page.tokens.length - 1].toMs / 1000;
		const debut = Math.max(0, page.startMs / 1000 - 0.05);
		return {g, debut, fin: Math.min(suivante ? suivante.startMs / 1000 - 0.05 : p.minutage.dureeSec, fin + 1.2), page};
	});
	const html = groupes
		.map(
			({g, debut, fin, page}) =>
				`\t\t<div id="g-${g}" class="clip" data-start="${r(debut)}" data-duration="${r(fin - debut)}"><div class="st-zone"><span id="gp-${g}" class="st-pastille">${page.tokens
					.map((t, j) => `<span id="m-${g}-${j}" class="st-mot">${t.text}</span>`)
					.join('')}</span></div></div>`,
		)
		.join('\n');
	const script = groupes
		.map(({g, debut, fin, page}) => {
			const entree = Math.min(0.25, (fin - debut) / 3);
			const sortie = Math.min(0.12, (fin - debut) / 4);
			const lignes = [`\t\t\ttl.fromTo('#gp-${g}', {opacity: 0, y: 24, scale: 0.92}, {opacity: 1, y: 0, scale: 1, duration: ${r(entree)}, ease: 'back.out(2)'}, ${r(debut)});`];
			page.tokens.forEach((t, j) => {
				const off = page.tokens[j + 1] ? page.tokens[j + 1].fromMs / 1000 : t.toMs / 1000;
				lignes.push(
					`\t\t\ttl.set('#m-${g}-${j}', {color: '${SOUS_TITRES.motActif}'}, ${r(t.fromMs / 1000)}).set('#m-${g}-${j}', {color: '${SOUS_TITRES.texte}'}, ${r(Math.max(t.fromMs / 1000 + 0.05, off))});`,
				);
			});
			lignes.push(`\t\t\ttl.to('#gp-${g}', {opacity: 0, duration: ${r(sortie)}, ease: 'power2.in'}, ${r(fin - sortie)});`);
			return lignes.join('\n');
		})
		.join('\n');
	return `<!-- Généré par npm run preparer : ne pas modifier à la main (texte : le script ; style : assets/kit/kit.css). -->
<template>
	<style>
		#root {
			position: absolute;
			inset: 0;
		}
	</style>
	<div id="root" data-composition-id="sous-titres" data-width="${FORMAT.largeur}" data-height="${FORMAT.hauteur}">
${html}
	</div>
	<script>
		(function () {
			const tl = gsap.timeline({paused: true});
${script}
			window.__timelines['sous-titres'] = tl;
		})();
	</script>
</template>
`;
};

const ecrireIndex = (p: Preparation, kitData: object) => {
	const duree = r(p.minutage.dureeSec);
	const t = MOUVEMENT.transitionSec;
	const hotes = p.scenes
		.map((s, k) => {
			const dureeHote = k === p.scenes.length - 1 ? s.fin - s.debut : s.fin - s.debut + t;
			return `\t\t\t<div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="${s.fichier}" data-start="${r(s.debut)}" data-duration="${r(dureeHote)}" data-track-index="1" data-track-kind="graphics" data-width="${FORMAT.largeur}" data-height="${FORMAT.hauteur}" style="z-index: ${k + 2}"></div>`;
		})
		.join('\n');
	// Volume : la crête de chaque bruitage tombe SON.sousLaVoixDb sous celle de la voix.
	const volume = r(Math.min(3.98, 10 ** ((p.minutage.voixCreteDb - SON.sousLaVoixDb - CRETE_FICHIER_DB) / 20)));
	const sons = p.bruitages
		.map(
			(b, i) =>
				`\t\t\t<audio id="son-${i + 1}" class="clip" src="assets/sons/${b.son}.wav" data-start="${r(b.sec)}" data-duration="${r(Math.min(SONS[b.son].dureeSec, duree - b.sec))}" data-track-index="${5 + (i % 3)}" data-volume="${volume}"></audio><!-- ${b.cause} -->`,
		)
		.join('\n');
	return `<!doctype html>
<!-- Généré par npm run preparer à partir de video.json : ne pas modifier à la main. -->
<html lang="fr">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=${FORMAT.largeur}, height=${FORMAT.hauteur}" />
		<script src="assets/kit/gsap.min.js"></script>
		<script src="assets/kit/kit.js"></script>
		<link rel="stylesheet" href="assets/kit/kit.css" />
		<script>
			window.KIT = ${JSON.stringify(kitData)};
		</script>
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			html,
			body {
				width: ${FORMAT.largeur}px;
				height: ${FORMAT.hauteur}px;
				overflow: hidden;
				background: #9f8fc7;
			}
			/* Sous la scène (y > ${SCENE_BAS}) : le sol continue en dégradé, jamais de bande vide. */
			#socle {
				position: absolute;
				inset: 0;
				background: linear-gradient(180deg, #d2ab96 0%, #c3b5df 55%, #8a79b8 100%);
			}
			/* Léger grain sur toute l'image. */
			#grain {
				position: absolute;
				inset: 0;
				pointer-events: none;
				opacity: 0.07;
				mix-blend-mode: multiply;
			}
		</style>
	</head>
	<body>
		<div id="root" data-composition-id="main" data-start="0" data-duration="${duree}" data-width="${FORMAT.largeur}" data-height="${FORMAT.hauteur}">
			<div id="socle" data-layout-ignore></div>
${hotes}
			<div id="avatar" class="clip" data-composition-id="avatar" data-composition-src="compositions/avatar.html" data-start="0" data-duration="${duree}" data-track-index="2" data-track-kind="graphics" data-width="${FORMAT.largeur}" data-height="${FORMAT.hauteur}" style="z-index: 40"></div>
			<div id="sous-titres" class="clip" data-composition-id="sous-titres" data-composition-src="compositions/sous-titres.html" data-start="0" data-duration="${duree}" data-track-index="3" data-track-kind="captions" data-width="${FORMAT.largeur}" data-height="${FORMAT.hauteur}" style="z-index: 50"></div>
			<svg id="grain" viewBox="0 0 ${FORMAT.largeur} ${FORMAT.hauteur}" data-layout-ignore style="z-index: 60">
				<filter id="grain-filtre"><feTurbulence id="grain-bruit" type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1" /></filter>
				<rect width="100%" height="100%" filter="url(#grain-filtre)" />
			</svg>
			<audio id="voix" class="clip" src="assets/audio/voix.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
${sons}
		</div>
		<script>
			(function () {
				const tl = gsap.timeline({paused: true});
				// Grain qui change 12 fois par seconde, graine tirée du temps (rendu identique à chaque fois).
				const bruit = document.getElementById('grain-bruit');
				const horloge = {t: 0};
				tl.fromTo(horloge, {t: 0}, {t: ${duree}, duration: ${duree}, ease: 'none', onUpdate: () => bruit.setAttribute('seed', 1 + (Math.floor(horloge.t * 12) % 97))}, 0);
				window.__timelines = window.__timelines || {};
				window.__timelines['main'] = tl;
			})();
		</script>
	</body>
</html>
`;
};

export const preparer = (id: string, {whisper = process.env.KIT_WHISPER !== 'non'} = {}) => {
	const video = chargerVideo(id);
	const dossier = dossierVideo(id);
	if (!existsSync(video.audio)) {
		throw new Error(`Audio introuvable : ${video.audio} (déposer la voix en WAV, puis relancer)`);
	}
	const minutage = calculerMinutage(video.script, video.audio, FORMAT.ips, {whisper});
	const p = resoudre(video, minutage);

	// Kit d'exécution, polices, GSAP, avatar, sons, voix.
	const kit = path.join(dossier, 'assets/kit');
	for (const f of ['kit.js', 'kit.css']) copier(path.join(RACINE, 'kit/runtime', f), path.join(kit, f));
	copier(path.join(RACINE, 'node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2'), path.join(kit, 'fonts/inter-800.woff2'));
	copier(path.join(RACINE, 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2'), path.join(kit, 'fonts/inter-700.woff2'));
	copier(path.join(RACINE, 'node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2'), path.join(kit, 'fonts/poppins-800.woff2'));
	copier(path.join(RACINE, 'node_modules/gsap/dist/gsap.min.js'), path.join(kit, 'gsap.min.js'));
	copier(path.join(RACINE, 'kit/runtime/avatar.html'), path.join(dossier, 'compositions/avatar.html'));
	genererSons(path.join(dossier, 'assets/sons'), [...new Set(p.bruitages.map((b) => b.son))]);
	copier(video.audio, path.join(dossier, 'assets/audio/voix.wav'));

	const gaucheAvatar = video.avatar?.cote === 'gauche' ? -AVATAR.horsCadre : FORMAT.largeur - AVATAR.largeur + AVATAR.horsCadre;
	const kitData = {
		fps: FORMAT.ips,
		duree: r(minutage.dureeSec),
		source: minutage.source,
		transitionSec: MOUVEMENT.transitionSec,
		travelling: MOUVEMENT.travelling,
		zoomMot: MOUVEMENT.zoomMot,
		scenes: p.scenes.map((s) => ({id: s.id, debut: r(s.debut), fin: r(s.fin), transition: s.transition, cible: s.cible})),
		ancres: Object.fromEntries(p.ancres.map((a) => [`${a.scene}|${a.brute}`, r(a.sec)])),
		poses: minutage.phrases.map((ph) => ({t: r(ph.start), pose: ph.pose})),
		bouche: minutage.bouche,
		avatar: {
			cote: video.avatar?.cote ?? 'droite',
			largeur: AVATAR.largeur,
			hauteur: AVATAR.hauteur,
			gauche: gaucheAvatar,
			haut: SCENE_BAS + AVATAR.dessousScene - AVATAR.hauteur,
		},
	};

	writeFileSync(path.join(dossier, 'compositions/sous-titres.html'), ecrireSousTitres(p));
	writeFileSync(path.join(dossier, 'index.html'), ecrireIndex(p, kitData));
	writeFileSync(
		path.join(dossier, 'minutage.json'),
		JSON.stringify(
			{
				source: minutage.source,
				raison: minutage.raison,
				dureeSec: r(minutage.dureeSec),
				voixCreteDb: r(minutage.voixCreteDb),
				scenes: p.scenes,
				ancres: p.ancres.map((a) => ({scene: a.scene, ancre: a.brute, mot: a.motTrouve, motSec: r(a.motSec), sec: r(a.sec)})),
				bruitages: p.bruitages.map((b) => ({...b, sec: r(b.sec)})),
				phrases: minutage.phrases.map((ph) => ({texte: ph.text, emotion: ph.emotion, pose: ph.pose, start: r(ph.start), end: r(ph.end)})),
				mots: minutage.mots.map((w) => ({texte: w.text, start: r(w.start), end: r(w.end)})),
			},
			null,
			'\t',
		) + '\n',
	);
	return p;
};

if (import.meta.url === `file://${process.argv[1]}`) {
	const id = process.argv[2];
	if (!id) {
		console.error('Usage : npm run preparer -- <video>   (ex. : astuces-002)');
		process.exit(1);
	}
	try {
		const p = preparer(id);
		const scenes = readdirSync(path.join(dossierVideo(id), 'compositions')).length;
		console.log(`✓ ${id} préparée : ${p.minutage.mots.length} mots, ${p.scenes.length} scènes (${scenes} fichiers), ${p.ancres.length} ancres, ${p.bruitages.length} bruitages`);
		if (p.minutage.source === 'estimation') {
			console.log(`⚠ Heures des mots ESTIMÉES (Whisper indisponible : ${p.minutage.raison}). Les ancres sont calées sur cette estimation.`);
		}
		console.log(`Suite : npm run verifier -- ${id}`);
	} catch (e) {
		console.error(`✗ ${(e as Error).message}`);
		process.exit(1);
	}
}
