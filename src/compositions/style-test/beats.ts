import type {TimedWord} from '../../lib/timing';

export type Beats = {
	notebookMs: number;
	openMs: number;
	arrayMs: number;
	pickMs: number;
	outroMs: number;
};

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]/g, '');

// Début du premier mot qui commence par `prefix`, à partir de `fromMs`.
const findWord = (words: TimedWord[], prefix: string, fromMs = 0) =>
	words.find((w) => w.startMs >= fromMs && normalize(w.text).startsWith(prefix))?.startMs;

// Les étapes de l'animation se calent sur les mots clés de la voix ;
// à défaut, sur une fraction de la durée de l'audio.
export const computeBeats = (words: TimedWord[], audioMs: number): Beats => {
	const carnet = findWord(words, 'carnet') ?? audioMs * 0.25;
	const numerotees = findWord(words, 'numerot', carnet) ?? audioMs * 0.4;
	const valeur = findWord(words, 'valeur', numerotees) ?? audioMs * 0.6;
	const numero = findWord(words, 'numero', valeur) ?? audioMs * 0.8;
	return {
		notebookMs: 0,
		openMs: carnet,
		arrayMs: Math.max(numerotees, carnet + 1500),
		pickMs: Math.max(numero, valeur),
		outroMs: audioMs,
	};
};
