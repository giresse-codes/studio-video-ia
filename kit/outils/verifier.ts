// npm run verifier -- <video>      (ex. : npm run verifier -- astuces-002)
// Contrôles : durée et nombre de mots, sous-titres dans la zone sûre, écart de chaque ancre < 150 ms,
// puis une image par ancre dans docs/verifications/<video>/ (depuis out/<video>.mp4 s'il existe, sinon capture HyperFrames).
import {execFileSync, spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';
import {parseScript} from '../../src/lib/script';
import {ATEMPO_MAX, CHAINES, ETIQUETTE_MIN_PX, FORMAT, HYPERFRAMES_VERSION, SOUS_TITRES, SYNCHRO, ZONE_SURE} from '../config';
import {ancresDansCode, normaliser, resoudreAncre} from './ancres';
import {lireWav} from './minutage';
import {chargerVideo, dossierVideo} from './video';

type Resultat = {controle: string; ok: boolean; details: string[]; avertissement?: boolean};

const r2 = (x: number) => Math.round(x * 100) / 100;

const controlerDuree = (id: string): Resultat => {
	const video = chargerVideo(id);
	const regles = CHAINES[video.chaine];
	const mots = parseScript(readFileSync(video.script, 'utf8')).flatMap((p) => p.words).length;
	const details = [`script : ${mots} mots (cible ${regles.mots[0]}–${regles.mots[1]})`];
	if (!existsSync(video.audio)) {
		return {controle: 'Durée', ok: false, details: [...details, `audio absent : ${video.audio}`]};
	}
	const {echantillons, frequence} = lireWav(video.audio);
	const duree = echantillons.length / frequence;
	details.unshift(`audio : ${r2(duree)} s (cible ${regles.dureeSec[0]}–${regles.dureeSec[1]} s)`);
	let ok = duree >= regles.dureeSec[0] && duree <= regles.dureeSec[1] && mots >= regles.mots[0] && mots <= regles.mots[1];
	if (duree > regles.dureeSec[1]) {
		const aCouper = Math.ceil(mots * (1 - regles.dureeSec[1] / duree));
		const tempo = duree / regles.dureeSec[1];
		details.push(`trop long de ${r2(duree - regles.dureeSec[1])} s : proposer d'abord de couper environ ${aCouper} mots dans le script, puis réenregistrer`);
		details.push(
			tempo <= ATEMPO_MAX
				? `en dernier recours seulement : ffmpeg -i ${video.audio} -af atempo=${r2(tempo)} (max ${ATEMPO_MAX})`
				: `accélérer ne suffit pas (il faudrait atempo=${r2(tempo)} > ${ATEMPO_MAX}) : couper est obligatoire`,
		);
	} else if (duree < regles.dureeSec[0]) {
		details.push(`trop court de ${r2(regles.dureeSec[0] - duree)} s : étoffer l'explication`);
	}
	if (mots > regles.mots[1] && duree <= regles.dureeSec[1]) {
		details.push(`plus de ${regles.mots[1]} mots : le débit risque d'être trop rapide`);
		ok = false;
	}
	return {controle: 'Durée', ok, details};
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

const controlerAncres = (id: string): {resultat: Resultat; ancres: AncreVerifiee[]; avertissements: Resultat} => {
	const video = chargerVideo(id);
	const dossier = dossierVideo(id);
	const fichierMinutage = path.join(dossier, 'minutage.json');
	if (!existsSync(fichierMinutage)) {
		const r: Resultat = {controle: 'Ancres', ok: false, details: ['minutage.json absent : lancer npm run preparer']};
		return {resultat: r, ancres: [], avertissements: {controle: 'Bonnes pratiques', ok: true, details: []}};
	}
	const minutage = JSON.parse(readFileSync(fichierMinutage, 'utf8'));
	const mots = minutage.mots.map((w: {texte: string; start: number; end: number}) => ({text: w.texte, start: w.start, end: w.end}));
	const index = readFileSync(path.join(dossier, 'index.html'), 'utf8');
	const kit = JSON.parse(/window\.KIT = (\{.*\});/.exec(index)?.[1] ?? '{}');

	const details: string[] = [
		minutage.source === 'whisper'
			? 'heures des mots : Whisper'
			: `heures des mots : ESTIMATION (Whisper indisponible : ${minutage.raison ?? '?'}). Écarts mesurés par rapport à cette estimation.`,
	];
	const ancres: AncreVerifiee[] = [];
	let ok = true;
	const avert: string[] = [];
	for (const scene of minutage.scenes as {id: string; fichier: string; debut: number}[]) {
		const code = readFileSync(path.join(dossier, scene.fichier), 'utf8');
		const brutes = ancresDansCode(code);
		if (brutes.length === 0) avert.push(`${scene.id} : aucune ancre @mot dans le code`);
		for (const brute of brutes) {
			try {
				const a = resoudreAncre(brute, mots, scene.debut);
				const image = Math.round(a.sec * FORMAT.ips) / FORMAT.ips;
				const ecart = Math.abs(image - a.motSec);
				const prepare = kit.ancres?.[`${scene.id}|${brute}`];
				ancres.push({scene: scene.id, ancre: brute, mot: a.motTrouve, motSec: a.motSec, sec: image, ecart});
				if (ecart >= SYNCHRO.ecartMaxSec) {
					ok = false;
					details.push(`${scene.id} ${brute} : écart ${Math.round(ecart * 1000)} ms ≥ ${SYNCHRO.ecartMaxSec * 1000} ms`);
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
		// Heures écrites à la main (position de tween numérique > 0) : à remplacer par une ancre.
		code.split('\n').forEach((ligne, n) => {
			const m = /(?:tl|kit)\.\w+\(.*,\s*(\d+(?:\.\d+)?)\s*\)\s*;?\s*$/.exec(ligne);
			if (m && Number(m[1]) > 0) avert.push(`${scene.fichier}:${n + 1} : heure ${m[1]} s écrite à la main, la lier à un mot (S.ancre('@mot'))`);
		});
		// Textes trop petits dans la scène.
		for (const m of code.matchAll(/font-size:\s*(\d+)px/g)) {
			if (Number(m[1]) < ETIQUETTE_MIN_PX) avert.push(`${scene.fichier} : texte de ${m[1]} px (< ${ETIQUETTE_MIN_PX} px)`);
		}
	}
	// Première seconde : action à 0 s et son à 0,2 s.
	const premiere = readFileSync(path.join(dossier, video.scenes[0].fichier), 'utf8');
	if (!/,\s*0\s*\)|ancre\(\s*['"`]@0/.test(premiere)) avert.push(`${video.scenes[0].fichier} : aucune animation à 0 s (l'action doit commencer tout de suite)`);
	if (!minutage.bruitages.some((b: {sec: number}) => Math.abs(b.sec - SYNCHRO.premierSonSec) < 0.01)) {
		ok = false;
		details.push(`aucun son à ${SYNCHRO.premierSonSec} s`);
	}
	details.splice(1, 0, `${ancres.length} ancres, écart maximal ${ancres.length ? Math.round(Math.max(...ancres.map((a) => a.ecart)) * 1000) : 0} ms (seuil ${SYNCHRO.ecartMaxSec * 1000} ms)`);
	return {
		resultat: {controle: 'Ancres', ok, details},
		ancres,
		avertissements: {controle: 'Bonnes pratiques', ok: true, avertissement: avert.length > 0, details: avert},
	};
};

// Une image par ancre, 0,3 s après l'événement (le mouvement est engagé).
const extraireImages = (id: string, ancres: AncreVerifiee[]): Resultat => {
	const sortie = path.join('docs/verifications', id);
	rmSync(sortie, {recursive: true, force: true});
	mkdirSync(sortie, {recursive: true});
	const instants = ancres.map((a) => Math.round((a.sec + 0.3) * 1000) / 1000);
	const nom = (a: AncreVerifiee, i: number) => `${String(i + 1).padStart(2, '0')}-${a.scene}-${normaliser(a.ancre) || 'debut'}.png`;
	const rendu = path.join('out', `${id}.mp4`);
	if (ancres.length === 0) return {controle: 'Images', ok: false, details: ['aucune ancre : aucune image']};
	if (existsSync(rendu)) {
		ancres.forEach((a, i) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(instants[i]), '-i', rendu, '-frames:v', '1', path.join(sortie, nom(a, i))]));
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
		if (proche) copyFileSync(path.join(absolu, proche.f), path.join(sortie, nom(a, i)));
	});
	return {controle: 'Images', ok: true, details: [`${ancres.length} images capturées (vidéo pas encore rendue) dans ${sortie}/`]};
};

const id = process.argv[2];
if (!id) {
	console.error('Usage : npm run verifier -- <video>   (ex. : astuces-002)');
	process.exit(1);
}
const resultats: Resultat[] = [];
try {
	resultats.push(controlerDuree(id));
	resultats.push(await controlerSousTitres(id));
	const {resultat, ancres, avertissements} = controlerAncres(id);
	resultats.push(resultat);
	resultats.push(extraireImages(id, ancres));
	resultats.push(avertissements);

	const lignes = resultats.flatMap((r) => [`${r.ok ? (r.avertissement ? '⚠' : '✓') : '✗'} ${r.controle}`, ...r.details.map((d) => `    ${d}`)]);
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
process.exit(resultats.every((r) => r.ok) ? 0 : 1);
