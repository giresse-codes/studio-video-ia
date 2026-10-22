import {getAudioData} from '@remotion/media-utils';
import React from 'react';
import {AbsoluteFill, Audio, type CalculateMetadataFunction, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import script from '../../../channels/astuces/scripts/001-telephone-chauffe.md';
import {Avatar} from '../../components/Avatar';
import {WordCaptions} from '../../components/WordCaptions';
import {type AlignedSentence, type AlignedWord, alignToPauses, detectPauses} from '../../lib/align';
import {parseScript, type ScriptSentence} from '../../lib/script';
import {assignScenes} from './scene-plan';
import {atelierExtras, SOFT_SPRING, VIDEO} from '../../theme';
import {SceneProvider, STAGE} from './atelier';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Coupe} from './scenes/Scene2Coupe';
import {Scene3Chargeur} from './scenes/Scene3Chargeur';
import {Scene4Table} from './scenes/Scene4Table';
import {Scene5Sauna} from './scenes/Scene5Sauna';
import {Scene6Lithium} from './scenes/Scene6Lithium';
import {Scene7Cartes} from './scenes/Scene7Cartes';
import {Scene8Marathon} from './scenes/Scene8Marathon';
import {Scene9Question} from './scenes/Scene9Question';

const AUDIO = 'audio/astuces-001.wav';

const SCENES: React.FC[] = [Scene1Hook, Scene2Coupe, Scene3Chargeur, Scene4Table, Scene5Sauna, Scene6Lithium, Scene7Cartes, Scene8Marathon, Scene9Question];

export type Astuces001Props = {
	sentences: ScriptSentence[] | null;
	timings: AlignedSentence[] | null;
	words: AlignedWord[] | null;
	sceneStarts: number[] | null;
	audioDurationMs: number | null;
};

export const ASTUCES_001_DEFAULTS: Astuces001Props = {
	sentences: null,
	timings: null,
	words: null,
	sceneStarts: null,
	audioDurationMs: null,
};

// La durée vient de l'audio ; les mots sont calés sur les pauses de la voix.
export const calculateAstuces001Metadata: CalculateMetadataFunction<Astuces001Props> = async () => {
	const audio = await getAudioData(staticFile(AUDIO));
	const audioDurationMs = Math.round(audio.durationInSeconds * 1000);
	const sentences = parseScript(script);
	const pauses = detectPauses(audio.channelWaveforms[0], audio.sampleRate);
	const {words, sentences: timings} = alignToPauses(
		sentences.map((s) => s.words),
		pauses,
		audioDurationMs,
	);
	return {
		durationInFrames: Math.ceil((audioDurationMs / 1000) * VIDEO.fps),
		props: {sentences, timings, words, sceneStarts: assignScenes(sentences), audioDurationMs},
	};
};

const FADE_MS = 300;

export const Astuces001: React.FC<Astuces001Props> = ({sentences, timings, words, sceneStarts, audioDurationMs}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (!sentences || !timings || !words || !sceneStarts || audioDurationMs === null) {
		throw new Error('Astuces001 : calculateMetadata n’a pas préparé le script.');
	}
	const nowMs = (frame / fps) * 1000;

	// Une scène va du début de sa première phrase au début de la scène suivante.
	const sceneRanges = sceneStarts.map((sentence, k) => ({
		startMs: k === 0 ? 0 : timings[sentence].startMs,
		endMs: k === sceneStarts.length - 1 ? audioDurationMs : timings[sceneStarts[k + 1]].startMs,
	}));

	// Pose : émotion de la phrase en cours (ou de la dernière commencée).
	let current = 0;
	timings.forEach((t, i) => {
		if (nowMs >= t.startMs - 150) {
			current = i;
		}
	});
	const poseFrom = Math.round(((timings[current].startMs - 150) / 1000) * fps);

	// Caméra « Atelier » : léger zoom pendant chaque scène, dézoom final sur l'ensemble.
	const last = sceneRanges[sceneRanges.length - 1];
	const zoomOut = spring({frame: frame - Math.round((last.startMs / 1000) * fps), fps, config: SOFT_SPRING, durationInFrames: 40});

	return (
		<AbsoluteFill style={{background: atelierExtras.wall}}>
			{/* Pièce : mur et sol en perspective. */}
			<div
				style={{
					position: 'absolute',
					left: -400,
					right: -400,
					top: 1180,
					height: 1400,
					background: atelierExtras.floor,
					transform: 'perspective(1200px) rotateX(55deg)',
					transformOrigin: 'top center',
				}}
			/>
			{sceneRanges.map((range, k) => {
				if (nowMs < range.startMs - FADE_MS || nowMs > range.endMs + FADE_MS) {
					return null;
				}
				const Scene = SCENES[k];
				const fade = Math.min(
					interpolate(nowMs, [range.startMs - FADE_MS, range.startMs + FADE_MS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					interpolate(nowMs, [range.endMs - FADE_MS, range.endMs + FADE_MS], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				);
				const push = k === sceneRanges.length - 1 ? interpolate(zoomOut, [0, 1], [1.06, 0.96]) : interpolate(nowMs, [range.startMs, range.endMs], [1, 1.05]);
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: STAGE.left,
							top: STAGE.top,
							width: STAGE.width,
							height: STAGE.height,
							opacity: fade,
							transform: `scale(${push})`,
						}}
					>
						<SceneProvider value={{...range, words}}>
							<Scene />
						</SceneProvider>
					</div>
				);
			})}
			<Avatar
				pose={sentences[current].pose}
				previousPose={current > 0 ? sentences[current - 1].pose : undefined}
				poseFrom={poseFrom}
				speaking
				audioSrc={staticFile(AUDIO)}
				side="droite"
			/>
			<WordCaptions words={words} maxWordsPerPage={4} />
			<Audio src={staticFile(AUDIO)} />
		</AbsoluteFill>
	);
};
