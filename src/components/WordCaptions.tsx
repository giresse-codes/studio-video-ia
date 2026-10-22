import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TimedWord} from '../lib/timing';
import {CAPTIONS, SAFE_ZONE, SOFT_SPRING} from '../theme';
import {FONTS} from '../theme/fonts';

type Props = {
	words: (TimedWord & {sentence?: number})[];
	// Regroupe les mots en « pages » qui s'affichent ensemble.
	pageDurationMs?: number;
	// Si défini : pages de 3 à `maxWordsPerPage` mots, sans jamais couper entre deux phrases.
	maxWordsPerPage?: number;
	// Cache les sous-titres à partir de ce moment (phrase finale, par exemple).
	hideAfterMs?: number;
};

type Page = {startMs: number; tokens: {text: string; fromMs: number; toMs: number}[]};

const isSentenceEnd = (word: string) => /[.!?…]["»”]?$/.test(word);

// Pages de taille régulière : 7 mots → 4 + 3, 9 mots → 3 + 3 + 3.
const pagesByWordCount = (words: Props['words'], maxWords: number): Page[] => {
	const groups: Props['words'][] = [];
	let current: Props['words'] = [];
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
		const pages: Page[] = [];
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

// Une page reste affichée au plus ce temps après son dernier mot.
const LINGER_MS = 1200;

// Sous-titres mot à mot : la page courante s'affiche en bas de la zone sûre,
// le mot prononcé passe en jaune.
export const WordCaptions: React.FC<Props> = ({words, pageDurationMs = 1400, maxWordsPerPage, hideAfterMs = Infinity}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const nowMs = (frame / fps) * 1000;

	const pages: Page[] = useMemo(() => {
		if (maxWordsPerPage) {
			return pagesByWordCount(words, maxWordsPerPage);
		}
		const captions: Caption[] = words.map((w, i) => ({
			text: i === 0 ? w.text : ` ${w.text}`,
			startMs: w.startMs,
			endMs: w.endMs,
			timestampMs: null,
			confidence: null,
		}));
		return createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: pageDurationMs}).pages;
	}, [words, pageDurationMs, maxWordsPerPage]);

	if (nowMs >= hideAfterMs) {
		return null;
	}

	// La page reste affichée jusqu'au début de la suivante, pour éviter les trous.
	const index = pages.findIndex((page, i) => {
		const next = pages[i + 1];
		return nowMs >= page.startMs && (next === undefined || nowMs < next.startMs);
	});
	if (index === -1) {
		return null;
	}
	const page = pages[index];
	if (nowMs > page.tokens[page.tokens.length - 1].toMs + LINGER_MS) {
		return null;
	}

	const enter = spring({
		frame: frame - Math.round((page.startMs / 1000) * fps),
		fps,
		config: SOFT_SPRING,
		durationInFrames: 10,
	});

	return (
		<AbsoluteFill
			style={{
				top: SAFE_ZONE.top,
				left: SAFE_ZONE.left,
				right: SAFE_ZONE.right,
				bottom: SAFE_ZONE.bottom,
				// AbsoluteFill impose 100 % : on laisse les marges définir la taille.
				width: 'auto',
				height: 'auto',
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					fontFamily: FONTS.body,
					fontWeight: 800,
					fontSize: CAPTIONS.fontSize,
					lineHeight: 1.25,
					wordSpacing: 8,
					textAlign: 'center',
					opacity: enter,
					transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
				}}
			>
				{page.tokens.map((token) => {
					const active = nowMs >= token.fromMs && nowMs < token.toMs;
					return (
						<span
							key={token.fromMs}
							style={{
								color: active ? CAPTIONS.activeColor : CAPTIONS.inactiveColor,
								// Le contour est peint sous le remplissage : 2 × 6 px pour 6 px visibles.
								WebkitTextStroke: `${CAPTIONS.strokeWidth * 2}px ${CAPTIONS.strokeColor}`,
								paintOrder: 'stroke fill',
								whiteSpace: 'pre-wrap',
							}}
						>
							{token.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
