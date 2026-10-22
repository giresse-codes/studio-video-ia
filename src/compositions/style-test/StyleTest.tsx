import {getAudioDurationInSeconds} from '@remotion/media-utils';
import React from 'react';
import {AbsoluteFill, Audio, type CalculateMetadataFunction, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {WordCaptions} from '../../components/WordCaptions';
import {distributeWordsByLetters, type TimedWord} from '../../lib/timing';
import {OUTRO_SECONDS, SAFE_ZONE, SOFT_SPRING, THEMES, type ThemeId, VIDEO} from '../../theme';
import {FONTS} from '../../theme/fonts';
import {computeBeats} from './beats';
import {AtelierLabels, Background, CodeEditor} from './Decor';
import {NotebookToArray} from './NotebookToArray';
import {getSkin} from './skins';

export type StyleTestProps = {
	theme: ThemeId;
	// Fichier dans public/audio/.
	audioFile: string;
	text: string;
	finalPhrase: string;
	// Mots horodatés : fournis, ou calculés par calculateMetadata.
	words: TimedWord[] | null;
	// Rempli par calculateMetadata.
	audioDurationMs: number | null;
};

export const STYLE_TEST_DEFAULTS: StyleTestProps = {
	theme: 'schema',
	audioFile: 'test-voix-espeak.wav',
	text: "Un tableau, c'est comme un carnet aux pages numérotées. Pour retrouver une valeur, tu donnes simplement son numéro de page.",
	finalPhrase: 'Un tableau, c’est un carnet numéroté.',
	words: null,
	audioDurationMs: null,
};

// La durée vient de l'audio ; les mots sont répartis au prorata des lettres.
export const calculateStyleTestMetadata: CalculateMetadataFunction<StyleTestProps> = async ({props}) => {
	const audioDurationMs = Math.round((await getAudioDurationInSeconds(staticFile(`audio/${props.audioFile}`))) * 1000);
	const words = props.words ?? distributeWordsByLetters(props.text, audioDurationMs, {leadInMs: 100, tailMs: 150});
	return {
		durationInFrames: Math.ceil((audioDurationMs / 1000 + OUTRO_SECONDS) * VIDEO.fps),
		props: {...props, words, audioDurationMs},
	};
};

const FinalPhrase: React.FC<{text: string; startMs: number; theme: ThemeId}> = ({text, startMs, theme}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - Math.round((startMs / 1000) * fps) - 6, fps, config: SOFT_SPRING, durationInFrames: 20});
	const c = THEMES[theme].colors;
	const color = theme === 'atelier' ? '#1A1A1A' : c.ink;
	const accent = theme === 'schema' ? c.accent : theme === 'atelier' ? '#FFFFFF' : c.accent;
	const [head, ...rest] = text.split(',');
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
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				opacity: s,
				transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
			}}
		>
			<div style={{fontFamily: FONTS.title, fontWeight: FONTS.titleWeight, fontSize: 116, lineHeight: 1.12, color}}>
				{head}
				{rest.length > 0 ? ',' : null}
				{rest.length > 0 ? <div style={{color: accent}}>{rest.join(',').trim()}</div> : null}
			</div>
		</AbsoluteFill>
	);
};

export const StyleTest: React.FC<StyleTestProps> = ({theme, audioFile, finalPhrase, words, audioDurationMs}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	if (!words || audioDurationMs === null) {
		throw new Error('StyleTest : calculateMetadata n’a pas fourni les mots.');
	}
	const beats = computeBeats(words, audioDurationMs);
	const skin = getSkin(theme);

	// Centre de la forme : sous l'éditeur pour « Écran code », au centre de la zone sûre sinon.
	const safeCenterX = SAFE_ZONE.left + (VIDEO.width - SAFE_ZONE.left - SAFE_ZONE.right) / 2;
	const centerY = theme === 'ecran-code' ? 1010 : 790;
	const shapeScale = theme === 'ecran-code' ? 0.72 : 1;

	// Caméra « Atelier » : zoom lent sur la pièce, puis dézoom final sur l'ensemble.
	const camera =
		theme === 'atelier'
			? interpolate(frame, [0, (beats.pickMs / 1000) * fps, (audioDurationMs / 1000) * fps, durationInFrames], [1.0, 1.12, 0.92, 0.92], {
					extrapolateRight: 'clamp',
				})
			: 1;

	const findWord = (prefix: string) => words.find((w) => w.text.toLowerCase().startsWith(prefix))?.startMs;

	return (
		<AbsoluteFill>
			<Background theme={theme} />
			<AbsoluteFill style={{transform: `scale(${camera})`}}>
				{theme === 'ecran-code' ? <CodeEditor beats={beats} /> : null}
				<div style={{position: 'absolute', left: safeCenterX, top: centerY, transform: `scale(${shapeScale})`}}>
					<NotebookToArray beats={beats} skin={skin} />
				</div>
				{theme === 'atelier' ? (
					<AtelierLabels
						hideMs={beats.outroMs}
						labels={[
							{text: 'carnet', ms: findWord('carnet') ?? beats.openMs, x: SAFE_ZONE.left + 20, y: 250},
							{text: 'numéro de page', ms: findWord('numérot') ?? beats.arrayMs, x: 470, y: 1000},
							{text: 'valeur', ms: findWord('valeur') ?? beats.pickMs, x: 560, y: 470},
						]}
					/>
				) : null}
			</AbsoluteFill>
			<WordCaptions words={words} hideAfterMs={audioDurationMs + 200} />
			<FinalPhrase text={finalPhrase} startMs={audioDurationMs} theme={theme} />
			<Audio src={staticFile(`audio/${audioFile}`)} />
		</AbsoluteFill>
	);
};
