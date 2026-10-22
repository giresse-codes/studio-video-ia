import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TimedWord} from '../lib/timing';
import {CAPTIONS, SAFE_ZONE, SOFT_SPRING} from '../theme';
import {FONTS} from '../theme/fonts';

type Props = {
	words: TimedWord[];
	// Regroupe les mots en « pages » qui s'affichent ensemble.
	pageDurationMs?: number;
	// Cache les sous-titres à partir de ce moment (phrase finale, par exemple).
	hideAfterMs?: number;
};

// Sous-titres mot à mot : la page courante s'affiche en bas de la zone sûre,
// le mot prononcé passe en jaune.
export const WordCaptions: React.FC<Props> = ({words, pageDurationMs = 1400, hideAfterMs = Infinity}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const nowMs = (frame / fps) * 1000;

	const pages = useMemo(() => {
		const captions: Caption[] = words.map((w, i) => ({
			text: i === 0 ? w.text : ` ${w.text}`,
			startMs: w.startMs,
			endMs: w.endMs,
			timestampMs: null,
			confidence: null,
		}));
		return createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: pageDurationMs}).pages;
	}, [words, pageDurationMs]);

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
