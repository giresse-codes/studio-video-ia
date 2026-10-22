import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AVATAR_LAYOUT, SOFT_SPRING} from '../theme';

// Avatar original de la chaîne Astuces : jeune adulte en 2D plate,
// grande tête, lunettes rondes, cheveux bouclés, haut blanc, pantalon bleu.

export type AvatarPose = 'neutre' | 'explique' | 'montre' | 'surpris' | 'choque' | 'reflechit' | 'rit' | 'content';
export type AvatarSide = 'gauche' | 'droite';

type Props = {
	pose: AvatarPose;
	// La bouche suit le volume de `audioSrc` ; sinon elle reste fermée.
	speaking?: boolean;
	audioSrc?: string;
	side?: AvatarSide;
	// Transition douce depuis la pose précédente, à partir de l'image `poseFrom`.
	previousPose?: AvatarPose;
	poseFrom?: number;
};

const COLORS = {
	ink: '#141414',
	skin: '#C68A5E',
	hair: '#2A1B14',
	top: '#FFFFFF',
	pants: '#2F5FA7',
	mouth: '#6B1F2A',
	cheek: '#E58C6E',
} as const;

const STROKE = 6;

// Repère du dessin : viewBox 400 x 600, personnage vu de face.
// Le bras « avant » est celui tourné vers le centre de l'image (à gauche quand l'avatar est à droite).
const FRONT_SHOULDER = {x: 140, y: 292};
const BACK_SHOULDER = {x: 260, y: 292};
const UPPER_ARM = 80;
const FOREARM = 75;

type Point = {x: number; y: number};

type PoseParams = {
	frontHand: Point;
	backHand: Point;
	// 1 = index tendu.
	frontPointing: number;
	headTilt: number;
	bodyLift: number;
	browRaise: number;
	browTilt: number;
	eyeScale: number;
	happyEyes: number;
	lookX: number;
	lookY: number;
	mouthWidth: number;
	mouthCurve: number;
	mouthOpen: number;
	mouthShift: number;
	blush: number;
	// 1 = petits sursauts du rire.
	laugh: number;
};

const NEUTRAL: PoseParams = {
	frontHand: {x: 124, y: 442},
	backHand: {x: 276, y: 442},
	frontPointing: 0,
	headTilt: 0,
	bodyLift: 0,
	browRaise: 0,
	browTilt: 0,
	eyeScale: 1,
	happyEyes: 0,
	lookX: 0,
	lookY: 0,
	mouthWidth: 42,
	mouthCurve: 6,
	mouthOpen: 0,
	mouthShift: 0,
	blush: 0,
	laugh: 0,
};

const POSES: Record<AvatarPose, PoseParams> = {
	neutre: NEUTRAL,
	explique: {
		...NEUTRAL,
		backHand: {x: 336, y: 206},
		headTilt: 4,
		browRaise: 5,
		mouthWidth: 48,
		mouthCurve: 9,
	},
	montre: {
		...NEUTRAL,
		frontHand: {x: -4, y: 236},
		frontPointing: 1,
		headTilt: -6,
		browRaise: 4,
		lookX: -5,
		mouthWidth: 48,
		mouthCurve: 10,
	},
	surpris: {
		...NEUTRAL,
		frontHand: {x: 70, y: 252},
		backHand: {x: 330, y: 252},
		bodyLift: 10,
		browRaise: 14,
		eyeScale: 1.35,
		mouthWidth: 26,
		mouthCurve: 0,
		mouthOpen: 22,
	},
	choque: {
		...NEUTRAL,
		frontHand: {x: 124, y: 214},
		backHand: {x: 276, y: 214},
		bodyLift: 6,
		browRaise: 18,
		eyeScale: 1.5,
		mouthWidth: 34,
		mouthCurve: -4,
		mouthOpen: 30,
	},
	reflechit: {
		...NEUTRAL,
		backHand: {x: 222, y: 252},
		headTilt: 7,
		browRaise: 2,
		browTilt: 7,
		lookX: 5,
		lookY: -5,
		mouthWidth: 30,
		mouthCurve: -2,
		mouthShift: 10,
	},
	rit: {
		...NEUTRAL,
		frontHand: {x: 178, y: 404},
		backHand: {x: 226, y: 404},
		headTilt: -7,
		browRaise: 8,
		happyEyes: 1,
		mouthWidth: 64,
		mouthCurve: 18,
		mouthOpen: 24,
		blush: 1,
		laugh: 1,
	},
	content: {
		...NEUTRAL,
		frontHand: {x: 156, y: 398},
		backHand: {x: 244, y: 398},
		bodyLift: 4,
		browRaise: 6,
		happyEyes: 1,
		mouthWidth: 62,
		mouthCurve: 16,
		mouthOpen: 10,
		blush: 1,
	},
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const mixPose = (a: PoseParams, b: PoseParams, t: number): PoseParams => {
	const out = {} as Record<keyof PoseParams, unknown>;
	for (const key of Object.keys(a) as (keyof PoseParams)[]) {
		const va = a[key];
		const vb = b[key];
		out[key] =
			typeof va === 'number'
				? mix(va, vb as number, t)
				: {x: mix(va.x, (vb as Point).x, t), y: mix(va.y, (vb as Point).y, t)};
	}
	return out as PoseParams;
};

// Bras à deux segments : on place la main, le coude se calcule (cinématique inverse).
// Des deux coudes possibles, on garde le plus bas, comme sous l'effet du poids.
const solveArm = (shoulder: Point, hand: Point): {elbow: Point; hand: Point} => {
	const dx = hand.x - shoulder.x;
	const dy = hand.y - shoulder.y;
	const reach = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(UPPER_ARM - FOREARM) + 1), UPPER_ARM + FOREARM - 0.5);
	const toHand = Math.atan2(dy, dx);
	const bend = Math.acos((UPPER_ARM ** 2 + reach ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * reach));
	const elbowAngle = Math.sin(toHand + bend) > Math.sin(toHand - bend) ? toHand + bend : toHand - bend;
	const elbow = {x: shoulder.x + UPPER_ARM * Math.cos(elbowAngle), y: shoulder.y + UPPER_ARM * Math.sin(elbowAngle)};
	return {elbow, hand: {x: shoulder.x + reach * Math.cos(toHand), y: shoulder.y + reach * Math.sin(toHand)}};
};

const Arm: React.FC<{shoulder: Point; hand: Point; pointing: number}> = ({shoulder, hand, pointing}) => {
	const arm = solveArm(shoulder, hand);
	const sleeve = `M ${shoulder.x} ${shoulder.y} L ${arm.elbow.x} ${arm.elbow.y} L ${arm.hand.x} ${arm.hand.y}`;
	const dir = Math.atan2(arm.hand.y - arm.elbow.y, arm.hand.x - arm.elbow.x);
	const finger = {x: arm.hand.x + 26 * Math.cos(dir), y: arm.hand.y + 26 * Math.sin(dir)};
	return (
		<g>
			<path d={sleeve} stroke={COLORS.ink} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d={sleeve} stroke={COLORS.top} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			{pointing > 0.01 ? (
				<g opacity={pointing}>
					<line x1={arm.hand.x} y1={arm.hand.y} x2={finger.x} y2={finger.y} stroke={COLORS.ink} strokeWidth={15} strokeLinecap="round" />
					<line x1={arm.hand.x} y1={arm.hand.y} x2={finger.x} y2={finger.y} stroke={COLORS.skin} strokeWidth={6} strokeLinecap="round" />
				</g>
			) : null}
			<circle cx={arm.hand.x} cy={arm.hand.y} r={16} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={5} />
		</g>
	);
};

// Bouche : courbe fermée ou ouverte selon `open` (en px).
const MouthShape: React.FC<{width: number; curve: number; open: number; shift: number}> = ({width, curve, open, shift}) => {
	const x0 = 200 + shift - width / 2;
	const x1 = 200 + shift + width / 2;
	const y = 226 - curve * 0.5;
	if (open < 1.5) {
		return <path d={`M ${x0} ${y} Q ${200 + shift} ${y + curve * 1.6} ${x1} ${y}`} stroke={COLORS.ink} strokeWidth={STROKE} strokeLinecap="round" fill="none" />;
	}
	return (
		<path
			d={`M ${x0} ${y} Q ${200 + shift} ${y + curve * 0.5 - open * 0.3} ${x1} ${y} Q ${200 + shift} ${y + curve * 1.6 + open * 1.6} ${x0} ${y} Z`}
			fill={COLORS.mouth}
			stroke={COLORS.ink}
			strokeWidth={5}
			strokeLinejoin="round"
		/>
	);
};

// Ouverture de la bouche (px) d'après le volume de l'audio à l'image courante.
const AudioMouth: React.FC<{src: string; params: PoseParams}> = ({src, params}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioData = useAudioData(src);
	let volume = 0;
	if (audioData) {
		const bins = visualizeAudio({fps, frame, audioData, numberOfSamples: 32});
		// Les fréquences basses portent l'essentiel de la voix.
		volume = bins.slice(0, 12).reduce((sum, v) => sum + v, 0) / 12;
	}
	const open = interpolate(volume, [0.004, 0.05], [0, 28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<MouthShape
			width={Math.max(params.mouthWidth * 0.8, 30)}
			curve={params.mouthCurve * 0.6}
			open={Math.max(open, params.mouthOpen)}
			shift={params.mouthShift}
		/>
	);
};

// Petits cercles fusionnés : contour d'abord, remplissage ensuite.
const Curls: React.FC<{curls: [number, number, number][]}> = ({curls}) => (
	<g>
		{curls.map(([cx, cy, r]) => (
			<circle key={`o${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={COLORS.hair} stroke={COLORS.ink} strokeWidth={STROKE * 2} />
		))}
		{curls.map(([cx, cy, r]) => (
			<circle key={`f${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={COLORS.hair} />
		))}
	</g>
);

const BACK_CURLS: [number, number, number][] = [
	[112, 150, 30],
	[118, 108, 32],
	[142, 76, 34],
	[178, 58, 34],
	[220, 56, 34],
	[258, 72, 34],
	[284, 104, 32],
	[290, 148, 30],
];

const FRINGE_CURLS: [number, number, number][] = [
	[140, 96, 22],
	[170, 82, 24],
	[202, 78, 24],
	[234, 84, 23],
	[262, 100, 21],
];

const Eye: React.FC<{cx: number; params: PoseParams; blink: number}> = ({cx, params, blink}) => {
	const open = (1 - params.happyEyes) * (1 - blink);
	return (
		<g>
			<ellipse cx={cx + params.lookX} cy={166 + params.lookY} rx={7 * params.eyeScale} ry={9 * params.eyeScale * Math.max(open, 0.08)} fill={COLORS.ink} />
			{params.happyEyes > 0.01 ? (
				<path
					d={`M ${cx - 10} ${170} Q ${cx} ${156} ${cx + 10} ${170}`}
					stroke={COLORS.ink}
					strokeWidth={5}
					strokeLinecap="round"
					fill="none"
					opacity={params.happyEyes}
				/>
			) : null}
		</g>
	);
};

export const Avatar: React.FC<Props> = ({pose, speaking = false, audioSrc, side = 'droite', previousPose, poseFrom = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const t = previousPose ? spring({frame: frame - poseFrom, fps, config: SOFT_SPRING, durationInFrames: 14}) : 1;
	const params = mixPose(POSES[previousPose ?? pose], POSES[pose], t);

	// Respiration lente et clignement toutes les 3,5 s environ.
	const breath = Math.sin((frame / fps) * Math.PI * 0.8) * 3;
	const blinkPhase = frame % Math.round(fps * 3.5);
	const blink = blinkPhase < 4 ? interpolate(blinkPhase, [0, 2, 4], [0, 1, 0]) : 0;

	const laughBounce = Math.abs(Math.sin((frame / fps) * Math.PI * 4)) * 6 * params.laugh;
	const lift = -params.bodyLift - breath - laughBounce;
	const headTransform = `translate(0 ${lift * 1.2}) rotate(${params.headTilt} 200 250)`;
	const {width, height, right, left, bottom} = AVATAR_LAYOUT;

	return (
		<div
			style={{
				position: 'absolute',
				width,
				height,
				bottom,
				...(side === 'droite' ? {right} : {left}),
				// Le dessin regarde vers le centre : on le retourne quand il est à gauche.
				transform: side === 'gauche' ? 'scaleX(-1)' : undefined,
			}}
		>
			<svg viewBox="0 0 400 600" width={width} height={height} style={{overflow: 'visible'}}>
				{/* Ombre au sol. */}
				<ellipse cx={200} cy={584} rx={120 - params.bodyLift * 2} ry={12} fill={COLORS.ink} opacity={0.12} />
				{/* Jambes et chaussures. */}
				<g transform={`translate(0 ${-params.bodyLift})`}>
					<path
						d="M 140 430 L 260 430 L 257 566 L 207 566 L 200 478 L 193 566 L 143 566 Z"
						fill={COLORS.pants}
						stroke={COLORS.ink}
						strokeWidth={STROKE}
						strokeLinejoin="round"
					/>
					<ellipse cx={166} cy={572} rx={34} ry={13} fill={COLORS.ink} />
					<ellipse cx={234} cy={572} rx={34} ry={13} fill={COLORS.ink} />
				</g>
				<g transform={`translate(0 ${lift})`}>
					{/* Buste : haut blanc. */}
					<rect x={186} y={238} width={28} height={50} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={STROKE} />
					<path
						d="M 128 304 Q 128 280 156 278 L 244 278 Q 272 280 272 304 L 264 446 L 136 446 Z"
						fill={COLORS.top}
						stroke={COLORS.ink}
						strokeWidth={STROKE}
						strokeLinejoin="round"
					/>
					<path d="M 178 279 Q 200 304 222 279" fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={5} strokeLinejoin="round" />
				</g>
				{/* Tête. */}
				<g transform={headTransform}>
					<Curls curls={BACK_CURLS} />
					<circle cx={113} cy={176} r={17} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={STROKE} />
					<circle cx={287} cy={176} r={17} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={STROKE} />
					<ellipse cx={200} cy={162} rx={86} ry={92} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={STROKE} />
					<Curls curls={FRINGE_CURLS} />
					{/* Joues. */}
					<g opacity={0.35 * params.blush}>
						<ellipse cx={148} cy={206} rx={16} ry={9} fill={COLORS.cheek} />
						<ellipse cx={252} cy={206} rx={16} ry={9} fill={COLORS.cheek} />
					</g>
					{/* Sourcils. */}
					<g stroke={COLORS.ink} strokeWidth={7} strokeLinecap="round">
						<line x1={146} y1={128 - params.browRaise} x2={182} y2={128 - params.browRaise} transform={`rotate(${-params.browTilt * 0.4} 164 128)`} />
						<line x1={218} y1={128 - params.browRaise} x2={254} y2={128 - params.browRaise} transform={`rotate(${-params.browTilt} 236 128)`} />
					</g>
					<Eye cx={166} params={params} blink={blink} />
					<Eye cx={234} params={params} blink={blink} />
					{/* Lunettes rondes. */}
					<g fill="none" stroke={COLORS.ink} strokeWidth={STROKE}>
						<circle cx={166} cy={166} r={27} />
						<circle cx={234} cy={166} r={27} />
						<path d="M 193 162 Q 200 156 207 162" />
						<line x1={139} y1={162} x2={118} y2={158} />
						<line x1={261} y1={162} x2={282} y2={158} />
					</g>
					{/* Nez. */}
					<path d="M 200 182 Q 192 200 202 202" fill="none" stroke={COLORS.ink} strokeWidth={5} strokeLinecap="round" />
					{speaking && audioSrc ? (
						<AudioMouth src={audioSrc} params={params} />
					) : (
						<MouthShape width={params.mouthWidth} curve={params.mouthCurve} open={params.mouthOpen} shift={params.mouthShift} />
					)}
				</g>
				{/* Bras après la tête, pour que la main au menton passe devant le visage. */}
				<g transform={`translate(0 ${lift})`}>
					<Arm shoulder={BACK_SHOULDER} hand={{x: params.backHand.x, y: params.backHand.y - lift}} pointing={0} />
					<Arm shoulder={FRONT_SHOULDER} hand={{x: params.frontHand.x, y: params.frontHand.y - lift}} pointing={params.frontPointing} />
				</g>
			</svg>
		</div>
	);
};
