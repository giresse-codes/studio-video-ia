import type {TimedWord} from './timing';

export type CaptionWord = TimedWord & {sentence?: number};

export type CaptionPage = {startMs: number; tokens: {text: string; fromMs: number; toMs: number}[]};

const isSentenceEnd = (word: string) => /[.!?…]["»”]?$/.test(word);

// Pages de taille régulière : 7 mots → 4 + 3, 9 mots → 3 + 3 + 3.
export const pagesByWordCount = (words: CaptionWord[], maxWords: number): CaptionPage[] => {
	const groups: CaptionWord[][] = [];
	let current: CaptionWord[] = [];
	words.forEach((w, i) => {
		current.push(w);
		const next = words[i + 1];
		const sentenceChanges = next === undefined || (w.sentence !== undefined ? next.sentence !== w.sentence : isSentenceEnd(w.text));
		if (sentenceChanges) {
			groups.push(current);
			current = [];
		}
	});
	return groups.flatMap((group) => {
		const count = Math.ceil(group.length / maxWords);
		const pages: CaptionPage[] = [];
		let from = 0;
		for (let p = 0; p < count; p++) {
			const size = Math.round((group.length - from) / (count - p));
			const slice = group.slice(from, from + size);
			from += size;
			pages.push({
				startMs: slice[0].startMs,
				tokens: slice.map((w, i) => ({text: i === 0 ? w.text : ` ${w.text}`, fromMs: w.startMs, toMs: w.endMs})),
			});
		}
		return pages;
	});
};
