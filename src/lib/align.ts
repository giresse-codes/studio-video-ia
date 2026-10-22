import type {TimedWord} from './timing';

// Calage du texte sur la voix sans reconnaissance vocale : on repère les pauses
// dans l'audio, on associe les fins de phrase (et de virgule) aux pauses les plus
// plausibles, puis on répartit les mots au prorata des lettres entre ces repères.

export type Pause = {startMs: number; endMs: number};

export type AlignedWord = TimedWord & {sentence: number};

export type AlignedSentence = {startMs: number; endMs: number};

export const detectPauses = (
	samples: Float32Array,
	sampleRate: number,
	{thresholdDb = -35, minPauseMs = 250, windowMs = 10} = {},
): Pause[] => {
	const threshold = 10 ** (thresholdDb / 20);
	const win = Math.max(1, Math.round((sampleRate * windowMs) / 1000));
	const pauses: Pause[] = [];
	let silentFrom: number | null = null;
	for (let i = 0; i < samples.length; i += win) {
		let sum = 0;
		const end = Math.min(samples.length, i + win);
		for (let j = i; j < end; j++) {
			sum += samples[j] * samples[j];
		}
		const silent = Math.sqrt(sum / (end - i)) < threshold;
		const ms = (i / sampleRate) * 1000;
		if (silent && silentFrom === null) {
			silentFrom = ms;
		} else if (!silent && silentFrom !== null) {
			if (ms - silentFrom >= minPauseMs) {
				pauses.push({startMs: silentFrom, endMs: ms});
			}
			silentFrom = null;
		}
	}
	if (silentFrom !== null) {
		pauses.push({startMs: silentFrom, endMs: (samples.length / sampleRate) * 1000});
	}
	return pauses;
};

const countLetters = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').length;

type Segment = {words: string[]; letters: number; sentence: number; endsSentence: boolean};

// Découpe chaque phrase en segments aux virgules, points-virgules et deux-points.
const toSegments = (sentences: string[][]): Segment[] => {
	const segments: Segment[] = [];
	sentences.forEach((words, sentence) => {
		let current: string[] = [];
		words.forEach((word, i) => {
			current.push(word);
			const last = i === words.length - 1;
			if (last || /[,;:]$/.test(word)) {
				segments.push({
					words: current,
					letters: Math.max(1, current.reduce((sum, w) => sum + countLetters(w), 0)),
					sentence,
					endsSentence: last,
				});
				current = [];
			}
		});
	});
	return segments;
};

const SKIP_SENTENCE_END = 0.6;
const SKIP_COMMA = 0.05;
const MAX_SPAN = 10;

export const alignToPauses = (
	sentences: string[][],
	pauses: Pause[],
	audioDurationMs: number,
): {words: AlignedWord[]; sentences: AlignedSentence[]} => {
	const segments = toSegments(sentences);
	// Silences de début et de fin : ils bornent la parole.
	const first = pauses[0]?.startMs === 0 ? pauses[0] : null;
	const lastPause = pauses[pauses.length - 1];
	const tail = lastPause && lastPause.endMs >= audioDurationMs - 20 ? lastPause : null;
	const inner = pauses.filter((p) => p !== first && p !== tail);
	const speechStart = first?.endMs ?? 0;
	const speechEnd = tail?.startMs ?? audioDurationMs;

	const totalLetters = segments.reduce((sum, s) => sum + s.letters, 0);
	const innerPauseMs = inner.reduce((sum, p) => sum + (p.endMs - p.startMs), 0);
	const msPerLetter = (speechEnd - speechStart - innerPauseMs) / totalLetters;

	// Programmation dynamique : frontière k (entre segments k-1 et k) ↔ pause j.
	// Nœud de départ (0, -1), nœud d'arrivée (n, m).
	const n = segments.length;
	const m = inner.length;
	const lettersBefore = [0];
	for (const s of segments) {
		lettersBefore.push(lettersBefore[lettersBefore.length - 1] + s.letters);
	}
	const pauseEnd = (j: number) => (j < 0 ? speechStart : inner[j].endMs);
	const pauseStart = (j: number) => (j >= m ? speechEnd : inner[j].startMs);

	const key = (k: number, j: number) => k * (m + 2) + (j + 1);
	const cost = new Map<number, number>([[key(0, -1), 0]]);
	const prev = new Map<number, number>();

	for (let k = 1; k <= n; k++) {
		const jRange = k === n ? [m] : Array.from({length: m}, (_, j) => j);
		for (const j of jRange) {
			let best = Infinity;
			let bestFrom = -1;
			for (let k0 = Math.max(0, k - MAX_SPAN); k0 < k; k0++) {
				for (let j0 = Math.max(-1, j - MAX_SPAN); j0 < j; j0++) {
					const base = cost.get(key(k0, j0));
					if (base === undefined) {
						continue;
					}
					let skippedPauses = 0;
					let pausePenalty = 0;
					for (let q = j0 + 1; q < j; q++) {
						const len = (inner[q].endMs - inner[q].startMs) / 1000;
						skippedPauses += len * 1000;
						pausePenalty += 2 * len * len;
					}
					let boundaryPenalty = 0;
					for (let q = k0 + 1; q < k; q++) {
						boundaryPenalty += segments[q - 1].endsSentence ? SKIP_SENTENCE_END : SKIP_COMMA;
					}
					const actual = (pauseStart(j) - pauseEnd(j0) - skippedPauses) / 1000;
					const expected = ((lettersBefore[k] - lettersBefore[k0]) * msPerLetter) / 1000;
					if (actual <= 0) {
						continue;
					}
					const c = base + (actual - expected) ** 2 / Math.max(expected, 0.3) + boundaryPenalty + pausePenalty;
					if (c < best) {
						best = c;
						bestFrom = key(k0, j0);
					}
				}
			}
			if (bestFrom !== -1) {
				cost.set(key(k, j), best);
				prev.set(key(k, j), bestFrom);
			}
		}
	}

	// Remonte le meilleur chemin : liste des (frontière, pause) retenues.
	const path: [number, number][] = [];
	let node: number | undefined = key(n, m);
	while (node !== undefined) {
		path.unshift([Math.floor(node / (m + 2)), (node % (m + 2)) - 1]);
		node = prev.get(node);
	}

	const words: AlignedWord[] = [];
	for (let p = 1; p < path.length; p++) {
		const [k0, j0] = path[p - 1];
		const [k, j] = path[p];
		const spanStart = pauseEnd(j0);
		const spanEnd = pauseStart(j);
		const skipped = inner.slice(j0 + 1, Math.max(j0 + 1, j));
		const speechMs = spanEnd - spanStart - skipped.reduce((sum, q) => sum + q.endMs - q.startMs, 0);
		// Temps de parole → temps réel, en sautant les pauses non retenues.
		const toReal = (offset: number) => {
			let t = spanStart + offset;
			for (const q of skipped) {
				if (t >= q.startMs) {
					t += q.endMs - q.startMs;
				}
			}
			return t;
		};
		const spanWords = segments.slice(k0, k).flatMap((s) => s.words.map((w) => ({w, sentence: s.sentence})));
		const letters = spanWords.reduce((sum, x) => sum + Math.max(1, countLetters(x.w)), 0);
		let cursor = 0;
		for (const {w, sentence} of spanWords) {
			const d = (Math.max(1, countLetters(w)) / letters) * speechMs;
			// Un mot ne commence jamais pendant une pause : on le pousse à sa fin.
			const startMs = Math.round(toReal(cursor + 0.001));
			cursor += d;
			words.push({text: w, startMs, endMs: Math.round(toReal(cursor)), sentence});
		}
	}

	const aligned: AlignedSentence[] = sentences.map((_, i) => {
		const own = words.filter((w) => w.sentence === i);
		return {startMs: own[0]?.startMs ?? 0, endMs: own[own.length - 1]?.endMs ?? 0};
	});
	return {words, sentences: aligned};
};
