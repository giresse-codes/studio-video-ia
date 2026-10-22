import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Avatar, type AvatarPose, type AvatarSide} from '../components/Avatar';
import {WordCaptions} from '../components/WordCaptions';
import {distributeWordsByLetters} from '../lib/timing';
import {SAFE_ZONE, SOFT_SPRING, THEMES, VIDEO} from '../theme';
import {FONTS} from '../theme/fonts';

export const AVATAR_TEST_POSES: AvatarPose[] = ['neutre', 'explique', 'montre', 'surpris', 'reflechit', 'content'];
export const AVATAR_TEST_POSE_SECONDS = 2;

// Voix provisoire (espeak-ng) pour vérifier la bouche synchronisée sur le volume.
const AUDIO = 'audio/test-voix-espeak.wav';
const AUDIO_TEXT = "Un tableau, c'est comme un carnet aux pages numérotées. Pour retrouver une valeur, tu donnes simplement son numéro de page.";
const AUDIO_MS = 7088;
const WORDS = distributeWordsByLetters(AUDIO_TEXT, AUDIO_MS, {leadInMs: 100, tailMs: 150});

const PoseLabel: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: SOFT_SPRING, durationInFrames: 12});
	return (
		<div
			style={{
				position: 'absolute',
				top: SAFE_ZONE.top,
				left: SAFE_ZONE.left,
				fontFamily: FONTS.title,
				fontWeight: FONTS.titleWeight,
				fontSize: 96,
				color: THEMES.schema.colors.ink,
				opacity: s,
				transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
			}}
		>
			{text}
		</div>
	);
};

// Les 6 poses à la suite, 2 s chacune, sur fond « Schéma », avec le cadre de la zone sûre en pointillés.
export const AvatarTest: React.FC<{side: AvatarSide}> = ({side}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const poseFrames = AVATAR_TEST_POSE_SECONDS * fps;
	const index = Math.min(Math.floor(frame / poseFrames), AVATAR_TEST_POSES.length - 1);
	const audioSrc = staticFile(AUDIO);

	return (
		<AbsoluteFill style={{background: THEMES.schema.colors.background}}>
			<div
				style={{
					position: 'absolute',
					top: SAFE_ZONE.top,
					left: SAFE_ZONE.left,
					width: VIDEO.width - SAFE_ZONE.left - SAFE_ZONE.right,
					height: VIDEO.height - SAFE_ZONE.top - SAFE_ZONE.bottom,
					border: '3px dashed #D0D0D0',
					boxSizing: 'border-box',
				}}
			/>
			{AVATAR_TEST_POSES.map((pose, i) => (
				<Sequence key={pose} from={i * poseFrames} durationInFrames={poseFrames} layout="none">
					<PoseLabel text={pose} />
				</Sequence>
			))}
			<Avatar
				pose={AVATAR_TEST_POSES[index]}
				previousPose={index > 0 ? AVATAR_TEST_POSES[index - 1] : undefined}
				poseFrom={index * poseFrames}
				speaking
				audioSrc={audioSrc}
				side={side}
			/>
			<WordCaptions words={WORDS} hideAfterMs={AUDIO_MS + 300} />
			<Audio src={audioSrc} />
		</AbsoluteFill>
	);
};
