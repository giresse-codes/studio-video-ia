// Bibliothèque de bruitages synthétisés en local avec ffmpeg (aucun fichier téléchargé).
// Chaque son est produit avec une crête à -18 dBFS ; la préparation règle ensuite son volume
// pour que sa crête tombe SON.sousLaVoixDb sous celle de la voix.
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, renameSync, rmSync} from 'node:fs';
import path from 'node:path';

export const CRETE_FICHIER_DB = -18;

type Recette = {dureeSec: number; usage: string; filtre: string[]};

const bruit = (seed: number, d: number, centre: number, largeur: number) => [
	'-f',
	'lavfi',
	'-i',
	`anoisesrc=d=${d.toFixed(2)}:c=pink:r=48000:a=0.8:seed=${seed}`,
	'-af',
	`bandpass=f=${centre}:w=${largeur},afade=t=in:d=${(d * 0.6).toFixed(2)},afade=t=out:st=${(d * 0.6).toFixed(2)}:d=${(d * 0.4).toFixed(2)}`,
];
// Les apostrophes autour de l'expression sont lues par ffmpeg lui-même (syntaxe des filtres), pas par un shell.
const ton = (expr: string, d: number) => ['-f', 'lavfi', '-i', `aevalsrc='${expr}':s=48000:d=${d}`];

export const SONS: Record<string, Recette> = {
	'pop-1': {dureeSec: 0.18, usage: 'élément qui apparaît', filtre: ton('0.9*sin(2*PI*(520+900*exp(-t*40))*t)*exp(-t*28)', 0.18)},
	'pop-2': {dureeSec: 0.2, usage: 'élément qui apparaît (variante)', filtre: ton('0.9*sin(2*PI*(380+700*exp(-t*35))*t)*exp(-t*24)', 0.2)},
	'whoosh-1': {dureeSec: 0.43, usage: 'transition', filtre: bruit(1, 0.43, 1300, 1200)},
	'whoosh-2': {dureeSec: 0.51, usage: 'transition (variante)', filtre: bruit(2, 0.51, 1700, 1200)},
	'whoosh-3': {dureeSec: 0.59, usage: 'transition (variante)', filtre: bruit(3, 0.59, 2100, 1200)},
	'ding-1': {dureeSec: 0.9, usage: 'carte, chiffre, réponse', filtre: ton('(0.6*sin(2*PI*1318*t)+0.3*sin(2*PI*2636*t)+0.15*sin(2*PI*3954*t))*exp(-t*5)', 0.9)},
	'ding-2': {dureeSec: 0.8, usage: 'carte, chiffre (variante)', filtre: ton('(0.6*sin(2*PI*1568*t)+0.3*sin(2*PI*3136*t)+0.1*sin(2*PI*4704*t))*exp(-t*6)', 0.8)},
	boing: {dureeSec: 0.45, usage: 'gag, rebond', filtre: ton('0.8*sin(2*PI*(180+120*sin(2*PI*9*t)*exp(-t*4))*t)*exp(-t*6)', 0.45)},
	tic: {dureeSec: 0.06, usage: 'texte qui s’écrit, petit détail', filtre: ton('0.9*sin(2*PI*2400*t)*exp(-t*90)', 0.06)},
};

// ffmpeg écrit la mesure de volumedetect sur la sortie d'erreur.
export const creteDb = (fichier: string) => {
	const {stderr} = spawnSync('ffmpeg', ['-hide_banner', '-i', fichier, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'});
	const crete = /max_volume: (-?[\d.]+) dB/.exec(stderr)?.[1];
	if (crete === undefined) {
		throw new Error(`Mesure de volume impossible : ${fichier}`);
	}
	return Number(crete);
};

// Génère les sons demandés (ou tous) dans `dossier`, sans refaire ceux qui existent déjà.
export const genererSons = (dossier: string, noms = Object.keys(SONS)) => {
	mkdirSync(dossier, {recursive: true});
	for (const nom of noms) {
		const recette = SONS[nom];
		if (!recette) {
			throw new Error(`Bruitage inconnu : « ${nom} » (disponibles : ${Object.keys(SONS).join(', ')})`);
		}
		const cible = path.join(dossier, `${nom}.wav`);
		if (existsSync(cible)) continue;
		const brut = path.join(dossier, `${nom}.brut.wav`);
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...recette.filtre, brut]);
		const gain = CRETE_FICHIER_DB - creteDb(brut);
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', brut, '-af', `volume=${gain.toFixed(2)}dB`, '-ac', '1', '-ar', '48000', `${cible}.tmp.wav`]);
		renameSync(`${cible}.tmp.wav`, cible);
		rmSync(brut);
	}
};
