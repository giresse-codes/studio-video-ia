// Heure de chaque mot du script : Whisper local d'abord, sinon estimation calée sur les pauses de la voix.
// Les sous-titres gardent toujours le texte du script (orthographe, sans indications).
import {spawnSync} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {alignToPauses, detectPauses} from '../../src/lib/align';
import {parseScript, type ScriptSentence} from '../../src/lib/script';
import {HYPERFRAMES_VERSION} from '../config';
import {normaliser} from './ancres';

export type Mot = {text: string; start: number; end: number; phrase: number};

export type Minutage = {
	source: 'whisper' | 'estimation';
	raison?: string;
	dureeSec: number;
	phrases: (ScriptSentence & {start: number; end: number})[];
	mots: Mot[];
	// Volume de la voix par image (0 à 1), pour la bouche de l'avatar.
	bouche: number[];
	// Crête de la voix (dBFS), pour placer les bruitages en dessous.
	voixCreteDb: number;
};

// WAV PCM 16 bits → échantillons mono entre -1 et 1 (moyenne des canaux).
export const lireWav = (fichier: string) => {
	const buf = readFileSync(fichier);
	if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.readUInt16LE(20) !== 1 || buf.readUInt16LE(34) !== 16) {
		throw new Error(`${fichier} : WAV PCM 16 bits attendu (convertir avec ffmpeg -i entree -acodec pcm_s16le sortie.wav)`);
	}
	const canaux = buf.readUInt16LE(22);
	const frequence = buf.readUInt32LE(24);
	let offset = 12;
	while (buf.toString('ascii', offset, offset + 4) !== 'data') {
		offset += 8 + buf.readUInt32LE(offset + 4);
	}
	const n = buf.readUInt32LE(offset + 4) / 2 / canaux;
	const echantillons = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		let somme = 0;
		for (let c = 0; c < canaux; c++) {
			somme += buf.readInt16LE(offset + 8 + (i * canaux + c) * 2);
		}
		echantillons[i] = somme / canaux / 32768;
	}
	return {echantillons, frequence};
};

type MotWhisper = {text: string; start: number; end: number};

// Transcription Whisper locale via la CLI HyperFrames (modèle multilingue, français).
const transcrire = (audio: string): MotWhisper[] => {
	const dossier = mkdtempSync(path.join(tmpdir(), 'minutage-'));
	try {
		const r = spawnSync(
			'npx',
			['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, 'transcribe', path.resolve(audio), '--model', 'small', '--language', 'fr', '--json', '--dir', dossier],
			{encoding: 'utf8', timeout: 15 * 60 * 1000},
		);
		const sortie = r.stdout ?? '';
		const json = sortie.includes('{') ? JSON.parse(sortie.slice(sortie.indexOf('{'))) : {};
		if (r.status !== 0 || json.ok === false) {
			throw new Error(json.error ?? (r.stderr || 'échec de la transcription').trim().split('\n').pop());
		}
		const fichier = json.transcriptPath ?? json.path ?? path.join(dossier, 'assets', 'transcript.json');
		const brut = existsSync(fichier) ? JSON.parse(readFileSync(fichier, 'utf8')) : json.words ?? json;
		const mots: MotWhisper[] = (Array.isArray(brut) ? brut : brut.words ?? []).map((w: {text: string; start: number; end: number}) => ({
			text: w.text,
			start: Number(w.start),
			end: Number(w.end),
		}));
		if (mots.length === 0) {
			throw new Error('transcription vide');
		}
		return mots;
	} finally {
		rmSync(dossier, {recursive: true, force: true});
	}
};

// Associe chaque mot du script à un mot transcrit (alignement par distance d'édition sur les mots normalisés).
// Un mot du script sans correspondant prend l'heure interpolée entre ses voisins.
const aligner = (script: string[], whisper: MotWhisper[]): {start: number; end: number}[] => {
	const a = script.map(normaliser);
	const b = whisper.map((w) => normaliser(w.text));
	const n = a.length;
	const m = b.length;
	const cout = Array.from({length: n + 1}, () => new Float64Array(m + 1));
	for (let i = 1; i <= n; i++) cout[i][0] = i;
	for (let j = 1; j <= m; j++) cout[0][j] = j;
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			const egal = a[i - 1] === b[j - 1] ? 0 : 1;
			cout[i][j] = Math.min(cout[i - 1][j - 1] + egal, cout[i - 1][j] + 1, cout[i][j - 1] + 1);
		}
	}
	const paire: (number | null)[] = new Array(n).fill(null);
	let i = n;
	let j = m;
	while (i > 0 && j > 0) {
		const egal = a[i - 1] === b[j - 1] ? 0 : 1;
		if (cout[i][j] === cout[i - 1][j - 1] + egal) {
			paire[i - 1] = j - 1;
			i--;
			j--;
		} else if (cout[i][j] === cout[i - 1][j] + 1) {
			i--;
		} else {
			j--;
		}
	}
	const horaires = paire.map((p) => (p === null ? null : {start: whisper[p].start, end: whisper[p].end}));
	return horaires.map((h, k) => {
		if (h) return h;
		const avant = horaires.slice(0, k).reverse().find(Boolean);
		const apres = horaires.slice(k + 1).find(Boolean);
		const start = avant ? avant.end : apres ? apres.start : 0;
		return {start, end: apres ? Math.max(start, apres.start) : start + 0.3};
	});
};

export const calculerMinutage = (fichierScript: string, fichierAudio: string, ips: number, {whisper = true} = {}): Minutage => {
	const phrases = parseScript(readFileSync(fichierScript, 'utf8'));
	const {echantillons, frequence} = lireWav(fichierAudio);
	const dureeSec = echantillons.length / frequence;

	let source: Minutage['source'] = 'whisper';
	let raison: string | undefined;
	let mots: Mot[];
	const motsScript = phrases.flatMap((p, k) => p.words.map((text) => ({text, phrase: k})));
	try {
		if (!whisper) {
			throw new Error('Whisper désactivé (KIT_WHISPER=non)');
		}
		const horaires = aligner(
			motsScript.map((w) => w.text),
			transcrire(fichierAudio),
		);
		mots = motsScript.map((w, k) => ({...w, ...horaires[k]}));
	} catch (erreur) {
		source = 'estimation';
		raison = String((erreur as Error).message ?? erreur)
			.split('\n')
			.find((l) => l.trim()) ?? 'Whisper indisponible';
		const {words} = alignToPauses(
			phrases.map((p) => p.words),
			detectPauses(echantillons, frequence),
			dureeSec * 1000,
		);
		mots = words.map((w) => ({text: w.text, start: w.startMs / 1000, end: w.endMs / 1000, phrase: w.sentence}));
	}

	const phrasesHoraires = phrases.map((p, k) => {
		const siens = mots.filter((w) => w.phrase === k);
		return {...p, start: siens[0]?.start ?? 0, end: siens[siens.length - 1]?.end ?? 0};
	});

	// Enveloppe de la voix par image et crête.
	const parImage = Math.round(frequence / ips);
	const bouche: number[] = [];
	let crete = 0;
	for (let i = 0; i < echantillons.length; i += parImage) {
		let somme = 0;
		const fin = Math.min(echantillons.length, i + parImage);
		for (let k = i; k < fin; k++) {
			somme += echantillons[k] * echantillons[k];
			crete = Math.max(crete, Math.abs(echantillons[k]));
		}
		const db = 20 * Math.log10(Math.sqrt(somme / (fin - i)) + 1e-9);
		bouche.push(Math.round(Math.min(1, Math.max(0, (db + 42) / 24)) * 100) / 100);
	}

	return {source, raison, dureeSec, phrases: phrasesHoraires, mots, bouche, voixCreteDb: 20 * Math.log10(crete + 1e-9)};
};
