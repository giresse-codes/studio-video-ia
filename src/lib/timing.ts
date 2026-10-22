export type TimedWord = {
	text: string;
	startMs: number;
	endMs: number;
};

const countLetters = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').length;

// Plan de secours : répartit les mots du texte sur la durée de l'audio,
// au prorata du nombre de lettres de chaque mot.
export const distributeWordsByLetters = (
	text: string,
	audioDurationMs: number,
	{leadInMs = 0, tailMs = 0}: {leadInMs?: number; tailMs?: number} = {},
): TimedWord[] => {
	const tokens = text.split(/\s+/).filter(Boolean);
	// Un mot fait d'une seule ponctuation (« : », « ? ») s'attache au précédent.
	const words: string[] = [];
	for (const token of tokens) {
		if (countLetters(token) === 0 && words.length > 0) {
			words[words.length - 1] += ` ${token}`;
		} else {
			words.push(token);
		}
	}
	const weights = words.map((w) => Math.max(1, countLetters(w)));
	const total = weights.reduce((sum, w) => sum + w, 0);
	const available = Math.max(0, audioDurationMs - leadInMs - tailMs);

	let cursor = leadInMs;
	return words.map((word, i) => {
		const duration = (weights[i] / total) * available;
		const startMs = Math.round(cursor);
		cursor += duration;
		return {text: word, startMs, endMs: Math.round(cursor)};
	});
};
