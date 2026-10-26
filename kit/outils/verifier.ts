// npm run verifier -- <video>      (ex. : npm run verifier -- astuces-002)
// Affiche la durée, puis signale seulement :
//   (a) un silence de plus de 0,6 s dans la voix,
//   (b) une scène qui reste plus de 6 s sans nouvel élément visuel (aucune ancre entre deux moments),
//   (c) une ancre à plus de 150 ms de son mot (ou périmée, ou introuvable).
// Extrait aussi une image par ancre dans docs/verifications/<video>/.
// Option --zone-sure : mesure en plus les sous-titres dans la zone sûre (navigateur, polices du rendu).
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';
import {detectPauses} from '../../src/lib/align';
import {parseScript} from '../../src/lib/script';
import {DUREE, FORMAT, HYPERFRAMES_VERSION, REBOND, SIGNAUX, SOUS_TITRES, SYNCHRO, ZONE_SURE} from '../config';
import {ancresDansCode, normaliser, resoudreAncre} from './ancres';
import {lireWav} from './minutage';
import {chargerVideo, dossierVideo} from './video';

type Resultat = {controle: string; ok: boolean; details: string[]};

const r2 = (x: number) => Math.round(x * 100) / 100;
const sec = (x: number) => `${x.toFixed(2)} s`;

// Durée : affichée, jamais jugée (elle suit le contenu). Le budget de 2,5 mots/s est un repère.
const afficherDuree = (id: string): Resultat => {
	const video = chargerVideo(id);
	const mots = parseScript(readFileSync(video.script, 'utf8')).flatMap((p) => p.words).length;
	const details = [`script : ${mots} mots, soit environ ${Math.round(mots / DUREE.motsParSeconde)} s au rythme indicatif de ${DUREE.motsParSeconde} mots/s`];
	if (!existsSync(video.audio)) {
		return {controle: 'Durée', ok: false, details: [...details, `audio absent : ${video.audio}`]};
	}
	const {echantillons, frequence} = lireWav(video.audio);
	const duree = echantillons.length / frequence;
	details.unshift(`audio : ${sec(duree)} (${r2(mots / duree)} mots/s)`);
	if (duree > REBOND.desSec) {
		details.push(`plus de ${REBOND.desSec} s : prévoir un rebond d'attention toutes les ${REBOND.toutesLesSec[0]} à ${REBOND.toutesLesSec[1]} s (environ ${Math.floor(duree / REBOND.toutesLesSec[1])} à ${Math.floor(duree / REBOND.toutesLesSec[0])})`);
	}
	return {controle: 'Durée', ok: true, details};
};

// (a) Silences de plus de 0,6 s dans la voix (y compris au début et à la fin).
const controlerSilences = (id: string): Resultat => {
	const video = chargerVideo(id);
	if (!existsSync(video.audio)) return {controle: 'Silences', ok: false, details: [`audio absent : ${video.audio}`]};
	const {echantillons, frequence} = lireWav(video.audio);
	const silences = detectPauses(echantillons, frequence, {minPauseMs: SIGNAUX.silenceMaxSec * 1000}).filter((p) => p.endMs - p.startMs > SIGNAUX.silenceMaxSec * 1000);
	return {
		controle: 'Silences',
		ok: silences.length === 0,
		details: silences.length === 0 ? [`aucun silence de plus de ${SIGNAUX.silenceMaxSec} s`] : silences.map((p) => `silence de ${sec((p.endMs - p.startMs) / 1000)} à ${sec(p.startMs / 1000)}`),
	};
};

// Chrome utilisé par HyperFrames (mêmes polices, même moteur que le rendu), ou KIT_NAVIGATEUR.
const cheminNavigateur = () => {
	if (process.env.KIT_NAVIGATEUR) return process.env.KIT_NAVIGATEUR;
	const sortie = spawnSync('npx', ['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, 'browser', 'path'], {encoding: 'utf8'}).stdout ?? '';
	const chemin = sortie.trim().split('\n').pop()?.trim();
	if (!chemin || !existsSync(chemin)) {
		throw new Error('Chrome introuvable : lancer npx hyperframes browser ensure, ou définir KIT_NAVIGATEUR');
	}
	return chemin;
};

// Option --zone-sure : sous-titres mesurés dans un navigateur avec les polices du rendu.
const controlerSousTitres = async (id: string): Promise<Resultat> => {
	const dossier = dossierVideo(id);
	const fichier = path.join(dossier, 'compositions/sous-titres.html');
	if (!existsSync(fichier)) {
		return {controle: 'Sous-titres', ok: false, details: ['compositions/sous-titres.html absent : lancer npm run preparer']};
	}
	const source = readFileSync(fichier, 'utf8');
	const groupes = source.slice(source.indexOf('<div id="root"'), source.indexOf('</template>')).replace(/<script>[\s\S]*<\/script>/, '');
	// Page de mesure dans le dossier de la vidéo, pour charger assets/kit/kit.css et ses polices.
	const page = path.join(dossier, '.verification-sous-titres.html');
	writeFileSync(
		page,
		`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="assets/kit/kit.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{width:${FORMAT.largeur}px;height:${FORMAT.hauteur}px;position:relative}#root{position:absolute;inset:0}.clip{position:absolute;inset:0}</style></head><body>${groupes}</body></html>`,
	);
	const navigateur = await chromium.launch({executablePath: cheminNavigateur()});
	try {
		const onglet = await navigateur.newPage({viewport: {width: FORMAT.largeur, height: FORMAT.hauteur}});
		await onglet.goto(`file://${path.resolve(page)}`);
		await onglet.evaluate(() => document.fonts.ready);
		const mesures = await onglet.evaluate(() =>
			Array.from(document.querySelectorAll<HTMLElement>('.st-pastille')).map((el) => {
				const b = el.getBoundingClientRect();
				return {texte: el.textContent ?? '', gauche: b.left, droite: b.right, haut: b.top, bas: b.bottom, taille: parseFloat(getComputedStyle(el).fontSize), police: document.fonts.check(`800 56px "Kit Inter"`)};
			}),
		);
		const limites = {gauche: ZONE_SURE.gauche, droite: FORMAT.largeur - ZONE_SURE.droite, bas: FORMAT.hauteur - ZONE_SURE.bas, haut: ZONE_SURE.haut};
		const fautes = mesures
			.filter((m) => m.gauche < limites.gauche - 0.5 || m.droite > limites.droite + 0.5 || m.bas > limites.bas + 0.5 || m.haut < limites.haut || m.taille < SOUS_TITRES.taillePx)
			.map((m) => `« ${m.texte} » : x ${Math.round(m.gauche)}–${Math.round(m.droite)}, y ${Math.round(m.haut)}–${Math.round(m.bas)}, ${m.taille} px`);
		const details = [
			`${mesures.length} groupes mesurés avec les polices du rendu (zone : x ${limites.gauche}–${limites.droite}, bas ≤ ${limites.bas}, ${SOUS_TITRES.taillePx} px minimum)`,
			...fautes,
		];
		if (mesures.length > 0 && !mesures[0].police) {
			details.push('police « Kit Inter » non chargée : mesure faussée (relancer npm run preparer)');
			return {controle: 'Sous-titres', ok: false, details};
		}
		return {controle: 'Sous-titres', ok: fautes.length === 0 && mesures.length > 0, details};
	} finally {
		await navigateur.close();
		rmSync(page, {force: true});
	}
};

type AncreVerifiee = {scene: string; ancre: string; mot: string; motSec: number; sec: number; ecart: number};
type SceneMinutage = {id: string; fichier: string; debut: number; fin: number};

const lireMinutage = (id: string) => {
	const fichier = path.join(dossierVideo(id), 'minutage.json');
	if (!existsSync(fichier)) throw new Error('minutage.json absent : lancer npm run preparer');
	return JSON.parse(readFileSync(fichier, 'utf8'));
};

// (c) Écart de chaque ancre à son mot, après arrondi à l'image (et préparation à jour).
const controlerAncres = (id: string): {resultat: Resultat; ancres: AncreVerifiee[]} => {
	const dossier = dossierVideo(id);
	const minutage = lireMinutage(id);
	const mots = minutage.mots.map((w: {texte: string; start: number; end: number}) => ({text: w.texte, start: w.start, end: w.end}));
	const kit = JSON.parse(/window\.KIT = (\{.*\});/.exec(readFileSync(path.join(dossier, 'index.html'), 'utf8'))?.[1] ?? '{}');
	const details: string[] = [
		minutage.source === 'whisper'
			? 'heures des mots : Whisper'
			: `heures des mots : ESTIMATION (Whisper indisponible : ${minutage.raison ?? '?'}). Écarts mesurés par rapport à cette estimation.`,
	];
	const ancres: AncreVerifiee[] = [];
	let ok = true;
	for (const scene of minutage.scenes as SceneMinutage[]) {
		for (const brute of ancresDansCode(readFileSync(path.join(dossier, scene.fichier), 'utf8'))) {
			try {
				const a = resoudreAncre(brute, mots, scene.debut);
				const image = Math.round(a.sec * FORMAT.ips) / FORMAT.ips;
				const ecart = Math.abs(image - a.motSec);
				const prepare = kit.ancres?.[`${scene.id}|${brute}`];
				ancres.push({scene: scene.id, ancre: brute, mot: a.motTrouve, motSec: a.motSec, sec: image, ecart});
				if (ecart > SYNCHRO.ecartMaxSec) {
					ok = false;
					details.push(`${scene.id} ${brute} : écart ${Math.round(ecart * 1000)} ms > ${SYNCHRO.ecartMaxSec * 1000} ms`);
				}
				if (prepare === undefined || Math.abs(prepare - a.sec) > 0.001) {
					ok = false;
					details.push(`${scene.id} ${brute} : préparation périmée (relancer npm run preparer)`);
				}
			} catch (e) {
				ok = false;
				details.push(`${scene.id} : ${(e as Error).message}`);
			}
		}
	}
	details.splice(1, 0, `${ancres.length} ancres, écart maximal ${ancres.length ? Math.round(Math.max(...ancres.map((a) => a.ecart)) * 1000) : 0} ms (seuil ${SYNCHRO.ecartMaxSec * 1000} ms)`);
	return {resultat: {controle: 'Ancres', ok, details}, ancres};
};

// (b) Nouveaux éléments : le début de la scène, puis chaque ancre (un élément apparaît, bouge ou zoome sur un mot).
// Un trou de plus de 6 s entre deux de ces moments, ou jusqu'à la fin de la scène, est signalé.
const controlerNouveautes = (id: string, ancres: AncreVerifiee[]): Resultat => {
	const minutage = lireMinutage(id);
	const details: string[] = [];
	for (const scene of minutage.scenes as SceneMinutage[]) {
		const moments = [scene.debut, ...ancres.filter((a) => a.scene === scene.id).map((a) => a.sec), scene.fin]
			.filter((t) => t >= scene.debut - 0.001 && t <= scene.fin + 0.001)
			.sort((x, y) => x - y);
		for (let i = 1; i < moments.length; i++) {
			const trou = moments[i] - moments[i - 1];
			if (trou > SIGNAUX.sceneSansNouveauteMaxSec) {
				details.push(`${scene.id} : ${sec(trou)} sans nouvel élément, de ${sec(moments[i - 1])} à ${sec(moments[i])}`);
			}
		}
	}
	return {
		controle: 'Nouveaux éléments',
		ok: details.length === 0,
		details: details.length === 0 ? [`aucune scène ne reste plus de ${SIGNAUX.sceneSansNouveauteMaxSec} s sans nouvel élément`] : details,
	};
};

// Une image par ancre, 0,3 s après l'événement (le mouvement est engagé).
const extraireImages = (id: string, ancres: AncreVerifiee[]): Resultat => {
	const sortie = path.join('docs/verifications', id);
	rmSync(sortie, {recursive: true, force: true});
	mkdirSync(sortie, {recursive: true});
	const instants = ancres.map((a) => Math.round((a.sec + 0.3) * 1000) / 1000);
	// JPEG de bonne qualité : une vidéo produit des dizaines d'images, le PNG alourdirait le dépôt.
	const nom = (a: AncreVerifiee, i: number) => `${String(i + 1).padStart(2, '0')}-${a.scene}-${normaliser(a.ancre) || 'debut'}.jpg`;
	const rendu = path.join('out', `${id}.mp4`);
	if (ancres.length === 0) return {controle: 'Images', ok: false, details: ['aucune ancre : aucune image']};
	if (existsSync(rendu)) {
		ancres.forEach((a, i) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(instants[i]), '-i', rendu, '-frames:v', '1', '-q:v', '3', path.join(sortie, nom(a, i))]));
		return {controle: 'Images', ok: true, details: [`${ancres.length} images extraites de ${rendu} dans ${sortie}/`]};
	}
	// Pas encore rendue : capture des instants dans le projet HyperFrames (même moteur que le rendu).
	const capture = spawnSync('npx', ['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, 'snapshot', '--at', instants.join(',')], {cwd: dossierVideo(id), encoding: 'utf8'});
	const dossierCapture = /(\S*\.hyperframes\/artifacts\/snapshots\/[0-9a-f-]+)/.exec(capture.stdout ?? '')?.[1];
	if (capture.status !== 0 || !dossierCapture) {
		return {controle: 'Images', ok: false, details: [`capture impossible : ${(capture.stderr || capture.stdout || '').trim().split('\n').pop()}`]};
	}
	const absolu = path.isAbsolute(dossierCapture) ? dossierCapture : path.join(dossierVideo(id), dossierCapture);
	const fichiers = readdirSync(absolu).filter((f) => /^frame-\d+-at-[\d.]+s\.png$/.test(f));
	ancres.forEach((a, i) => {
		const proche = fichiers
			.map((f) => ({f, t: Number(/at-([\d.]+)s/.exec(f)?.[1])}))
			.sort((x, y) => Math.abs(x.t - instants[i]) - Math.abs(y.t - instants[i]))[0];
		if (proche) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(absolu, proche.f), '-q:v', '3', path.join(sortie, nom(a, i))]);
	});
	return {controle: 'Images', ok: true, details: [`${ancres.length} images capturées (vidéo pas encore rendue) dans ${sortie}/`]};
};

const id = process.argv[2];
const zoneSure = process.argv.includes('--zone-sure');
if (!id || id.startsWith('--')) {
	console.error('Usage : npm run verifier -- <video> [--zone-sure]   (ex. : astuces-002)');
	process.exit(1);
}
const resultats: Resultat[] = [];
try {
	resultats.push(afficherDuree(id));
	resultats.push(controlerSilences(id));
	const {resultat, ancres} = controlerAncres(id);
	resultats.push(controlerNouveautes(id, ancres));
	resultats.push(resultat);
	if (zoneSure) resultats.push(await controlerSousTitres(id));
	const images = extraireImages(id, ancres);

	const lignes = [...resultats, images].flatMap((r) => [`${r.ok ? '✓' : '✗'} ${r.controle}`, ...r.details.map((d) => `    ${d}`)]);
	const tableau = ancres.map((a) => `| ${a.scene} | \`${a.ancre}\` | ${a.mot} | ${a.motSec.toFixed(2)} | ${a.sec.toFixed(2)} | ${Math.round(a.ecart * 1000)} |`);
	mkdirSync(path.join('docs/verifications', id), {recursive: true});
	writeFileSync(
		path.join('docs/verifications', id, 'rapport.md'),
		`# Vérification : ${id}\n\n\`\`\`\n${lignes.join('\n')}\n\`\`\`\n\n| Scène | Ancre | Mot | Mot (s) | Événement (s) | Écart (ms) |\n| --- | --- | --- | --- | --- | --- |\n${tableau.join('\n')}\n`,
	);
	console.log(lignes.join('\n'));
	console.log(`\nRapport : docs/verifications/${id}/rapport.md`);
} catch (e) {
	console.error(`✗ ${(e as Error).message}`);
	process.exit(1);
}
// Échec seulement si un signal (a), (b) ou (c) est levé (ou --zone-sure en faute).
process.exit(resultats.every((r) => r.ok) ? 0 : 1);
